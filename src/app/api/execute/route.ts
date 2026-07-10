import { NextResponse } from "next/server";
import judge0 from "@/lib/judge0";

// Judge0 language IDs
const LANGUAGE_CONFIG: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  go: 60,
  rust: 73,
  cpp: 54,
  csharp: 51,
  ruby: 72,
  swift: 83,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      language,
      code,
      stdin = "",
    }: {
      language?: string;
      code?: string;
      stdin?: string;
    } = body;

    if (!language || !code) {
      return NextResponse.json(
        {
          error: "Language and code are required.",
        },
        {
          status: 400,
        }
      );
    }

    const languageId = LANGUAGE_CONFIG[language.toLowerCase()];

    if (!languageId) {
      return NextResponse.json(
        {
          error: `Unsupported language: ${language}`,
        },
        {
          status: 400,
        }
      );
    }

    const { data } = await judge0.post(
      "/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: languageId,
        stdin,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Judge0 Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Internal Server Error";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}