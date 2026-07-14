import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { languages } from "./languages.js";

const EXECUTION_TIMEOUT_MS = 20_000;
const MAX_OUTPUT_BYTES = 64 * 1024;

function runProcess(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let timedOut = false;
    const append = (current, chunk) =>
      Buffer.concat([current, chunk]).subarray(0, MAX_OUTPUT_BYTES);
    child.stdout.on("data", (chunk) => {
      stdout = append(stdout, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr = append(stderr, chunk);
    });
    child.on("error", (error) =>
      resolve({
        exitCode: null,
        stdout,
        stderr: Buffer.from(error.message),
        timedOut,
      }),
    );
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({ exitCode, stdout, stderr, timedOut });
    });
  });
}

export async function execute({ language, source, stdin = "" }) {
  const config = languages[language];
  if (!config)
    throw new Error(
      "Unsupported language. Use python, javascript, cpp, or java.",
    );
  if (Buffer.byteLength(source, "utf8") > config.maxSourceBytes)
    throw new Error("Source code is too large.");
  if (Buffer.byteLength(stdin, "utf8") > 32_000)
    throw new Error("Standard input is too large.");
  const jobDir = await mkdtemp(path.join(os.tmpdir(), "codevyaas-job-"));
  const jobName = `codevyaas-${randomUUID()}`;
  try {
    await Promise.all([
      writeFile(path.join(jobDir, config.filename), source, {
        encoding: "utf8",
        mode: 0o444,
      }),
      writeFile(path.join(jobDir, "input.txt"), stdin, {
        encoding: "utf8",
        mode: 0o444,
      }),
    ]);
    const mount = config.writableWorkspace
      ? `type=bind,source=${jobDir},target=/workspace`
      : `type=bind,source=${jobDir},target=/workspace,readonly`;

    if (!config.image) {
      throw new Error(
        `Docker image is not configured for language: ${language}`,
      );
    }

    const args = [
      "run",
      "--rm",
      "--network",
      "none",
      "--read-only",
      "--tmpfs",
      "/tmp:rw,exec,nosuid,nodev,size=128m",
      "--pids-limit",
      "64",
      "--memory",
      "512m",
      "--memory-swap",
      "512m",
      "--cpus",
      "1.0",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges",
      "--user",
      "10001:10001",
      "--name",
      jobName,
      "--mount",
      mount,
      config.image,
    ];
    const result = await runProcess("docker", args, EXECUTION_TIMEOUT_MS);

    if (result.timedOut)
      await runProcess("docker", ["rm", "--force", jobName], 5_000);
    return {
      stdout: result.stdout.toString("utf8"),
      stderr: result.stderr.toString("utf8"),
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      truncated:
        result.stdout.length >= MAX_OUTPUT_BYTES ||
        result.stderr.length >= MAX_OUTPUT_BYTES,
    };
  } finally {
    await rm(jobDir, { recursive: true, force: true });
  }
}
