import { NextResponse } from "next/server";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export async function POST(request: Request) {
  try {
    const { messages, code, output, error, language } = await request.json();

    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5-coder:7b",
        stream: false,
        messages: [
          {
            role: "system",
            content: `You are a helpful coding assistant. You will be provided with the following information: 
            ${language} 
            Current Code: ${code}
            Current Output: ${output}
            Current Error: ${error}
            Instructions: 
            - Understand the code.
            - Read the compiler/runtime output.
            - Find the exact bug.
            - Explain why it happens.
            - Mention the line causing the error.
            - Suggest the fix.
            - Return corrected code if necessary.
            - If there is no error, optimize the code.
            - Answer in markdown.
            `,
          },
          ...messages.map((m: { role: string; text: string }) => ({
            role: m.role,
            content: m.text,
          })),
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      reply: data.message?.content ?? "No response received.",
    });
  } catch (error) {
    console.error("Ollama chat error:", error);

    return NextResponse.json(
      { error: "Could not connect to Ollama. Ensure Ollama is running." },
      { status: 500 },
    );
  }
}
