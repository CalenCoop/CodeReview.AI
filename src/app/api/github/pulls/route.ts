import { FetchGitHub } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo) {
    return NextResponse.json({ error: "Missing repo param" }, { status: 400 });
  }
  return FetchGitHub(`https://api.github.com/repos/${repo}/pulls`);
}
