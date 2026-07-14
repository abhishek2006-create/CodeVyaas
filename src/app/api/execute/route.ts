import { NextResponse } from "next/server";

const JUDGE_API_URL = process.env.JUDGE_API_URL ?? "http://localhost:3002";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      language,
      source,
      stdin = "",
    }: {
      language?: string;
      source?: string;
      stdin?: string;
    } = body;

    if (!language || !source) {
      return NextResponse.json(
        { error: "Language and source are required." },
        { status: 400 }
      );
    }

    const judgeResponse = await fetch(`${JUDGE_API_URL}/api/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: language.toLowerCase(),
        source,
        stdin,
      }),
      cache: "no-store",
    });

    const data = await judgeResponse.json();

    return NextResponse.json(data, {
      status: judgeResponse.status,
    });
  } catch (error) {
    console.error("Judge API Error:", error);

    return NextResponse.json(
      {
        error: "Judge service is unavailable. Ensure codevyaas-judge-api is running.",
      },
      { status: 502 }
    );
  }
}