export type CompilerLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "go"
  | "rust";

export type CompilerLanguageConfig = {
  id: CompilerLanguage;
  label: string;
  runtime: string;
  fileName: string;
  template: string;
};

export const COMPILER_LANGUAGES: CompilerLanguageConfig[] = [
  {
    id: "javascript",
    label: "JavaScript",
    runtime: "Node.js",
    fileName: "main.js",
    template: `function solve(input) {
  const text = input.trim();
  return text ? "Hello, " + text + "!" : "Hello, world!";
}

const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
console.log(solve(input));`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    runtime: "TypeScript",
    fileName: "main.ts",
    template: `function solve(input: string): string {
  const text = input.trim();
  return text ? \`Hello, \${text}!\` : "Hello, world!";
}

const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
console.log(solve(input));`,
  },
  {
    id: "python",
    label: "Python",
    runtime: "Python 3",
    fileName: "main.py",
    template: `def solve(raw: str) -> str:
    text = raw.strip()
    return f"Hello, {text}!" if text else "Hello, world!"


if __name__ == "__main__":
    import sys

    print(solve(sys.stdin.read()))`,
  },
  {
    id: "java",
    label: "Java",
    runtime: "OpenJDK",
    fileName: "Main.java",
    template: `import java.util.*;

public class Main {
  static String solve(String input) {
    input = input.trim();
    return input.isEmpty() ? "Hello, world!" : "Hello, " + input + "!";
  }

  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in).useDelimiter("\\\\A");
    String input = scanner.hasNext() ? scanner.next() : "";
    System.out.println(solve(input));
  }
}`,
  },
  {
    id: "cpp",
    label: "C++",
    runtime: "GNU G++",
    fileName: "main.cpp",
    template: `#include <iostream>
#include <string>
#include <sstream>

std::string solve(const std::string& input) {
  std::string text = input;
  while (!text.empty() && (text.back() == '\\n' || text.back() == '\\r' || text.back() == ' ')) {
    text.pop_back();
  }
  return text.empty() ? "Hello, world!" : "Hello, " + text + "!";
}

int main() {
  std::ostringstream buffer;
  buffer << std::cin.rdbuf();
  std::cout << solve(buffer.str()) << std::endl;
  return 0;
}`,
  },
  {
    id: "go",
    label: "Go",
    runtime: "Go",
    fileName: "main.go",
    template: `package main

import (
  "fmt"
  "io"
  "os"
  "strings"
)

func solve(input string) string {
  input = strings.TrimSpace(input)
  if input == "" {
    return "Hello, world!"
  }
  return "Hello, " + input + "!"
}

func main() {
  data, _ := io.ReadAll(os.Stdin)
  fmt.Println(solve(string(data)))
}`,
  },
  {
    id: "rust",
    label: "Rust",
    runtime: "Rust",
    fileName: "main.rs",
    template: `use std::io::{self, Read};

fn solve(input: &str) -> String {
    let text = input.trim();
    if text.is_empty() {
        "Hello, world!".to_string()
    } else {
        format!("Hello, {}!", text)
    }
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    println!("{}", solve(&input));
}`,
  },
];

export const DEFAULT_COMPILER_LANGUAGE: CompilerLanguage = "javascript";

export const getLanguageConfig = (language?: string) =>
  COMPILER_LANGUAGES.find((item) => item.id === language) ??
  COMPILER_LANGUAGES[0];
