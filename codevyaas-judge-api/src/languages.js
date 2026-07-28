export const languages = {
  python: {
    image: "codevyaas-runner-python:1.0",
    filename: "main.py",
    maxSourceBytes: 100_000,
  },
  javascript: {
    image: "codevyaas-runner-javascript:1.0",
    filename: "main.js",
    maxSourceBytes: 100_000,
  },
  cpp: {
    image: "codevyaas-runner-cpp:1.0",
    filename: "main.cpp",
    maxSourceBytes: 100_000,
    writableWorkspace: true,
  },
  java: {
    image: "codevyaas-runner-java:1.0",
    filename: "Main.java",
    maxSourceBytes: 100_000,
  },
  typescript: {
    image: "codevyaas-runner-typescript:1.0",
    filename: "main.js",
    maxSourceBytes: 100_000,
  },
  rust: {
    image: "codevyaas-runner-rust:1.0",
    filename: "main.rs",
    maxSourceBytes: 100_000,
    writableWorkspace: true,
  },
  go: {
    image: "codevyaas-runner-go:1.0",
    filename: "main.go",
    maxSourceBytes: 100_000,
    writableWorkspace: true,
  },
  csharp: {
    image: "codevyaas-runner-csharp:1.0",
    filename: "Program.cs",
    maxSourceBytes: 100_000,
    writableWorkspace: true,
  },
  ruby: {
    image: "codevyaas-runner-ruby:1.0",
    filename: "main.rb",
    maxSourceBytes: 100_000,
  },
  swift: {
    image: "codevyaas-runner-swift:1.0",
    filename: "main.swift",
    maxSourceBytes: 100_000,
    writableWorkspace: true,
  },
};
