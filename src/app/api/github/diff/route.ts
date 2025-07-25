import { FetchGitHub } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo");
  const num = request.nextUrl.searchParams.get("num");
  if (!repo || !num) {
    return NextResponse.json({
      message: "Missing Repo or PR Number",
      status: 400,
    });
  }
  return FetchGitHub(`https://api.github.com/repos/${repo}/pulls/${num}/files`);
}
