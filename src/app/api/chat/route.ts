import { NextResponse } from "next/server";

export const runtime = "nodejs";

type IncomingMessage = {
  role: "user" | "assistant";
  text: string;
};

type DebugBug = {
  line: number | null;
  title: string;
  reason: string;
  fix: string;
};

type DebugResponse = {
  replyMarkdown: string;
  errorType: string | null;
  bugs: DebugBug[];
  correctedCode: string | null;
};

const fallbackResponse: DebugResponse = {
  replyMarkdown: "I could not understand the model response.",
  errorType: null,
  bugs: [],
  correctedCode: null,
};

function toText(value: unknown) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

function clip(text: string, maxLength = 60000) {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}\n\n/* CODE TRUNCATED: file is too large */`;
}

function parseModelResponse(content: string): DebugResponse {
  try {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "");

    const parsed = JSON.parse(cleaned) as Partial<DebugResponse>;

    const bugs: DebugBug[] = Array.isArray(parsed.bugs)
      ? parsed.bugs.map((bug) => ({
          line:
            typeof bug.line === "number" && Number.isFinite(bug.line)
              ? bug.line
              : null,
          title:
            typeof bug.title === "string" ? bug.title : "Potential issue",
          reason:
            typeof bug.reason === "string"
              ? bug.reason
              : "The model did not provide a reason.",
          fix:
            typeof bug.fix === "string"
              ? bug.fix
              : "Review the corrected code.",
        }))
      : [];

    return {
      replyMarkdown:
        typeof parsed.replyMarkdown === "string"
          ? parsed.replyMarkdown
          : "No explanation returned.",
      errorType:
        typeof parsed.errorType === "string" ? parsed.errorType : null,
      bugs,
      correctedCode:
        typeof parsed.correctedCode === "string" &&
        parsed.correctedCode.trim().length > 0
          ? parsed.correctedCode
          : null,
    };
  } catch {
    return {
      ...fallbackResponse,
      replyMarkdown: content || fallbackResponse.replyMarkdown,
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messages: IncomingMessage[] = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (message: unknown): message is IncomingMessage =>
              typeof message === "object" &&
              message !== null &&
              "role" in message &&
              "text" in message &&
              ((message as IncomingMessage).role === "user" ||
                (message as IncomingMessage).role === "assistant") &&
              typeof (message as IncomingMessage).text === "string",
          )
          .slice(-12)
      : [];

    const language = toText(body.language || "unknown");
    const code = clip(toText(body.code));
    const output = clip(toText(body.output), 20000);
    const error = clip(toText(body.error), 20000);

    const systemPrompt = `
    You are CodeVyaas AI, an expert software debugging assistant connected to a live code editor.

    You receive:
    - Programming language
    - Current editor source code
    - Output panel content
    - Compiler/runtime error content
    - Conversation history

    Your responsibilities:
    1. Analyze the full current code.
    2. Read compiler and runtime errors carefully.
    3. Identify the most likely error type.
    4. Identify bug line numbers when possible.
    5. Explain the root cause clearly.
    6. Suggest exact fixes.
    7. Return full corrected source code when a code change is needed.
    8. Preserve the original language and useful functionality.
    9. Never claim that you executed the code yourself.
    10. If no runtime/compiler error exists, explain possible logic issues or improvements.

    Return ONLY valid JSON.

    Use exactly this response structure:

    {
      "replyMarkdown": "Markdown explanation for the user",
      "errorType": "SyntaxError | TypeError | RuntimeError | CompilationError | LogicError | ImportError | ReferenceError | null",
      "bugs": [
        {
          "line": 12,
          "title": "Short error title",
          "reason": "Why this happens",
          "fix": "How to fix it"
        }
      ],
      "correctedCode": "FULL corrected source code as a plain string, or null"
    }

    Rules:
    - correctedCode must contain the entire source file, never a patch or diff.
    - Do not wrap correctedCode in Markdown backticks.
    - Return correctedCode only when code should be changed.
    - If an error is present, prioritize fixing the error over optimization.
    `;

    const workspaceContext = JSON.stringify(
      {
        language,
        editorCode: code,
        outputPanel: output,
        errorPanel: error,
      },
      null,
      2,
    );

    const ollamaUrl =
      process.env.OLLAMA_URL || "http://127.0.0.1:11434";

    const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:"qwen2.5-coder:7b",
        stream: false,
        format: "json",
        options: {
          temperature: 0.1,
          num_ctx: 32768,
          num_predict: 8192,
        },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Current workspace state:\n${workspaceContext}`,
          },
          ...messages.map((m: { role: string; text: string }) => ({
            role: m.role,
            content: m.text,
          })),
        ],
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama returned ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    const content = ollamaData.message?.content || "";

    return NextResponse.json(parseModelResponse(content));
  } catch (error) {
    console.error("Ollama chat error:", error);

    return NextResponse.json(
      {
        error:
          "Could not connect to Ollama. Ensure Ollama is running and the selected model is installed.",
      },
      { status: 502 },
    );
  }
}
