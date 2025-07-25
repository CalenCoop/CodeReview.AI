import { FetchGitHub } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  const repo = request.nextUrl.searchParams.get("repo");
  const prId = request.nextUrl.searchParams.get("prId");
  if (!owner || !repo || !prId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  const diffUrl = `https://github.com/${owner}/${repo}/pull/${prId}.diff`;
  try {
    const response = await fetch(diffUrl);
    const diffText = await response.text();
    return new NextResponse(diffText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch diff" },
      { status: 500 }
    );
  }
}
