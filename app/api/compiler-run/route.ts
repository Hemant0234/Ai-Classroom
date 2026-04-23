import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

import { getLanguageConfig } from "@/lib/compiler";

const DEFAULT_EXECUTOR_URL = "https://emkc.org/api/v2/piston/execute";

type LocalExecutionResult = {
  output: string;
  exitCode: number;
};

type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

const createTempDir = async () =>
  fs.mkdtemp(path.join(os.tmpdir(), "cu-classroom-compiler-"));

const normalizeOutput = (stdout = "", stderr = "") =>
  `${stdout}${stdout && stderr ? "\n" : ""}${stderr}`.trim() ||
  "Program finished without output.";

const runCommand = async (
  command: string,
  args: string[],
  cwd: string,
  input: string
): Promise<CommandResult> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "pipe",
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        child.kill();
      }
    }, 10000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      settled = true;
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        reject(error);
        return;
      }
      reject(error);
    });

    child.on("close", (code, signal) => {
      if (settled) {
        return;
      }
      clearTimeout(timer);
      settled = true;
      resolve({
        stdout,
        stderr:
          signal === "SIGTERM" && !stderr
            ? "Execution timed out after 10 seconds."
            : stderr,
        exitCode: code ?? (signal ? 1 : 0),
      });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });

const executeLocally = async (
  language: string,
  code: string,
  stdin: string
): Promise<LocalExecutionResult> => {
  const selectedLanguage = getLanguageConfig(language);
  const tempDir = await createTempDir();
  const filePath = path.join(tempDir, selectedLanguage.fileName);

  try {
    await fs.writeFile(filePath, code, "utf8");

    switch (selectedLanguage.id) {
      case "javascript": {
        const { stdout, stderr, exitCode } = await runCommand(
          "node",
          [selectedLanguage.fileName],
          tempDir,
          stdin
        );

        return {
          output: normalizeOutput(stdout, stderr),
          exitCode,
        };
      }

      case "typescript": {
        const { stdout, stderr, exitCode } = await runCommand(
          "node",
          ["--experimental-strip-types", selectedLanguage.fileName],
          tempDir,
          stdin
        );

        return {
          output: normalizeOutput(stdout, stderr),
          exitCode,
        };
      }

      case "python": {
        const { stdout, stderr, exitCode } = await runCommand(
          "python",
          [selectedLanguage.fileName],
          tempDir,
          stdin
        );

        return {
          output: normalizeOutput(stdout, stderr),
          exitCode,
        };
      }

      case "java": {
        const compile = await runCommand(
          "javac",
          [selectedLanguage.fileName],
          tempDir,
          ""
        );

        if (compile.exitCode !== 0 || compile.stderr.trim()) {
          return {
            output: normalizeOutput(compile.stdout, compile.stderr),
            exitCode: compile.exitCode || 1,
          };
        }

        const run = await runCommand("java", ["Main"], tempDir, stdin);

        return {
          output: normalizeOutput(run.stdout, run.stderr),
          exitCode: run.exitCode,
        };
      }

      case "cpp": {
        const exePath = path.join(tempDir, "main.exe");
        const compile = await runCommand(
          "g++",
          ["-std=c++17", "-O2", selectedLanguage.fileName, "-o", exePath],
          tempDir,
          ""
        );

        if (compile.exitCode !== 0 || compile.stderr.trim()) {
          return {
            output: normalizeOutput(compile.stdout, compile.stderr),
            exitCode: compile.exitCode || 1,
          };
        }

        const run = await runCommand(exePath, [], tempDir, stdin);

        return {
          output: normalizeOutput(run.stdout, run.stderr),
          exitCode: run.exitCode,
        };
      }

      default:
        throw new Error(
          `${selectedLanguage.label} local runtime is not available on this machine yet.`
        );
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => null);
  }
};

const executeWithPiston = async (
  language: string,
  code: string,
  stdin: string
): Promise<LocalExecutionResult> => {
  const selectedLanguage = getLanguageConfig(language);
  const executorUrl =
    process.env.PISTON_API_URL?.trim() || DEFAULT_EXECUTOR_URL;

  const response = await fetch(executorUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: selectedLanguage.id,
      version: "*",
      files: [
        {
          name: selectedLanguage.fileName,
          content: code,
        },
      ],
      stdin,
      compile_timeout: 10000,
      run_timeout: 10000,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    const message =
      payload?.message ||
      "Execution service is unavailable right now. Try again shortly.";

    throw new Error(message);
  }

  const compileOutput = [
    payload?.compile?.stdout,
    payload?.compile?.stderr,
    payload?.compile?.output,
  ]
    .filter(Boolean)
    .join("");

  const runOutput = [
    payload?.run?.stdout,
    payload?.run?.stderr,
    payload?.run?.output,
  ]
    .filter(Boolean)
    .join("");

  return {
    output:
      [compileOutput, runOutput].filter(Boolean).join("\n").trim() ||
      "Program finished without output.",
    exitCode: payload?.run?.code ?? payload?.compile?.code ?? 0,
  };
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const language = body?.language;
    const code = typeof body?.code === "string" ? body.code : "";
    const stdin = typeof body?.stdin === "string" ? body.stdin : "";

    if (!language || !code.trim()) {
      return NextResponse.json(
        { error: "Language and code are required." },
        { status: 400 }
      );
    }

    if (code.length > 50000) {
      return NextResponse.json(
        { error: "Code is too large. Keep it under 50,000 characters." },
        { status: 400 }
      );
    }

    if (stdin.length > 10000) {
      return NextResponse.json(
        { error: "Input is too large. Keep it under 10,000 characters." },
        { status: 400 }
      );
    }

    const selectedLanguage = getLanguageConfig(language);

    try {
      const localResult = await executeLocally(language, code, stdin);

      return NextResponse.json({
        output: localResult.output,
        exitCode: localResult.exitCode,
        language: selectedLanguage.id,
        executor: "local",
      });
    } catch (localError) {
      try {
        const remoteResult = await executeWithPiston(language, code, stdin);

        return NextResponse.json({
          output: remoteResult.output,
          exitCode: remoteResult.exitCode,
          language: selectedLanguage.id,
          executor: "remote",
        });
      } catch (remoteError) {
        const localMessage =
          localError instanceof Error ? localError.message : "Local execution failed.";
        const remoteMessage =
          remoteError instanceof Error
            ? remoteError.message
            : "Remote execution failed.";

        return NextResponse.json(
          {
            error: `${localMessage} ${remoteMessage}`.trim(),
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected compiler execution error.",
      },
      { status: 500 }
    );
  }
}
