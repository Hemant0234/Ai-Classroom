"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Eraser,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import {
  useMutation,
  useSelf,
  useStorage,
} from "@/liveblocks.config";
import {
  COMPILER_LANGUAGES,
  type CompilerLanguage,
  getLanguageConfig,
} from "@/lib/compiler";
import { Participants } from "../../../board/[boardId]/_components/participants";

type CompilerCanvasProps = {
  compilerId: string;
};

const StatPill = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
    <span className="text-zinc-500">{label}</span>
    <span className="ml-2 font-medium text-zinc-100">{value}</span>
  </div>
);

export const CompilerCanvas = ({ compilerId }: CompilerCanvasProps) => {
  const compiler = useQuery(api.compiler.get, { id: compilerId as any });
  const userName =
    useSelf((me) => me.info?.name) || "A collaborator";

  const code = useStorage((root) => root.compilerCode) || "";
  const language = (useStorage((root) => root.compilerLanguage) ||
    "javascript") as CompilerLanguage;
  const input = useStorage((root) => root.compilerInput) || "";
  const output = useStorage((root) => root.compilerOutput) || "";
  const status = useStorage((root) => root.compilerStatus) || "idle";
  const lastRunAt = useStorage((root) => root.compilerLastRunAt) || 0;
  const lastRunBy = useStorage((root) => root.compilerLastRunBy) || "";

  const [isRunningLocal, setIsRunningLocal] = useState(false);

  const setCode = useMutation(({ storage }, nextCode: string) => {
    storage.set("compilerCode", nextCode);
  }, []);

  const setLanguage = useMutation(({ storage }, nextLanguage: string) => {
    storage.set("compilerLanguage", nextLanguage);
  }, []);

  const setInput = useMutation(({ storage }, nextInput: string) => {
    storage.set("compilerInput", nextInput);
  }, []);

  const setExecutionState = useMutation(
    (
      { storage },
      nextState: {
        output: string;
        status: string;
        lastRunAt: number;
        lastRunBy: string;
      }
    ) => {
      storage.set("compilerOutput", nextState.output);
      storage.set("compilerStatus", nextState.status);
      storage.set("compilerLastRunAt", nextState.lastRunAt);
      storage.set("compilerLastRunBy", nextState.lastRunBy);
    },
    []
  );

  const selectedLanguage = getLanguageConfig(language);
  const lineNumbers = Math.max(12, code.split("\n").length);
  const isRunning = isRunningLocal || status === "running";

  const handleLoadTemplate = () => {
    setCode(selectedLanguage.template);
    toast.success(`${selectedLanguage.label} starter template loaded.`);
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lab link copied.");
    } catch {
      toast.error("Failed to copy lab link.");
    }
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Output copied.");
    } catch {
      toast.error("Failed to copy output.");
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Add some code before running.");
      return;
    }

    setIsRunningLocal(true);
    setExecutionState({
      output: `Running ${selectedLanguage.label} code...`,
      status: "running",
      lastRunAt: Date.now(),
      lastRunBy: userName,
    });

    try {
      const response = await fetch("/api/compiler-run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage.id,
          code,
          stdin: input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Execution failed.");
      }

      setExecutionState({
        output: data.output,
        status: "idle",
        lastRunAt: Date.now(),
        lastRunBy: userName,
      });
      toast.success("Program executed successfully.");
    } catch (error) {
      setExecutionState({
        output:
          error instanceof Error
            ? error.message
            : "Execution failed unexpectedly.",
        status: "error",
        lastRunAt: Date.now(),
        lastRunBy: userName,
      });
      toast.error("Program execution failed.");
    } finally {
      setIsRunningLocal(false);
    }
  };

  const quickPrompts = [
    "Build a hello world solution",
    "Read input and print transformed output",
    "Write a function and test it with stdin",
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,transparent_26%),linear-gradient(180deg,#09090b_0%,#111827_48%,#030712_100%)] text-white">
      <Participants />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-8 pt-20 lg:px-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sky-300">
                <FlaskConical className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Real-Time Coding Lab
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {compiler?.title || "Collaborative Lab Session"}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
                  Write code together, share runtime input, and review common
                  output in one synchronized lab environment.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatPill label="Runtime" value={selectedLanguage.runtime} />
              <StatPill
                label="Status"
                value={status === "running" ? "Running" : status === "error" ? "Attention" : "Ready"}
              />
              <StatPill
                label="Last run"
                value={
                  lastRunAt
                    ? `${lastRunBy || "Unknown"} at ${new Date(
                        lastRunAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Not executed yet"
                }
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.95fr)]">
          <section className="rounded-[28px] border border-white/10 bg-[#090d18]/90 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Language
                  </p>
                  <select
                    value={language}
                    onChange={(event) =>
                      setLanguage(event.target.value as CompilerLanguage)
                    }
                    className="mt-1 bg-transparent text-sm font-medium text-white outline-none"
                  >
                    {COMPILER_LANGUAGES.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="bg-slate-900 text-white"
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleLoadTemplate}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                >
                  <Sparkles className="mr-2 inline h-4 w-4" />
                  Load starter
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                >
                  <Copy className="mr-2 inline h-4 w-4" />
                  Copy lab link
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setInput("")}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                >
                  <Eraser className="mr-2 inline h-4 w-4" />
                  Clear input
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/60"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 inline h-4 w-4" />
                      Run shared code
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid min-h-[720px] gap-0 lg:grid-cols-[72px_minmax(0,1fr)]">
              <div className="hidden border-r border-white/10 bg-[#070b14] py-4 text-right text-xs text-zinc-600 lg:block">
                {Array.from({ length: lineNumbers }).map((_, index) => (
                  <div key={index} className="px-4 leading-7">
                    {index + 1}
                  </div>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck={false}
                  placeholder={`Write ${selectedLanguage.label} code here...`}
                  className="h-[720px] w-full resize-none bg-transparent px-4 py-4 font-mono text-[14px] leading-7 text-zinc-100 outline-none"
                />
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Shared Input
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    stdin / test data
                  </h2>
                </div>
                <TerminalSquare className="h-5 w-5 text-sky-300" />
              </div>

              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                spellCheck={false}
                placeholder="Example:
5
1 2 3 4 5"
                className="mt-4 h-40 w-full resize-none rounded-2xl border border-white/10 bg-[#060912] px-4 py-3 font-mono text-sm text-zinc-100 outline-none transition focus:border-sky-400/40"
              />
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Shared Output
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Runtime console
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyOutput}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                  >
                    <Copy className="mr-1 inline h-3.5 w-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={() =>
                      setExecutionState({
                        output: "Run the code to see shared output here.",
                        status: "idle",
                        lastRunAt,
                        lastRunBy,
                      })
                    }
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                  >
                    <RotateCcw className="mr-1 inline h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              <pre className="mt-4 min-h-[260px] overflow-auto rounded-2xl border border-white/10 bg-[#060912] px-4 py-3 font-mono text-sm leading-6 text-emerald-200 whitespace-pre-wrap">
                {output}
              </pre>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Lab Workflow
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Suggested team prompts
              </h2>

              <div className="mt-4 space-y-3">
                {quickPrompts.map((prompt) => (
                  <div
                    key={prompt}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#060912] px-4 py-3"
                  >
                    <div className="pr-3 text-sm text-zinc-200">{prompt}</div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                Everyone in the room shares the same code, language, stdin, and
                output state.
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
