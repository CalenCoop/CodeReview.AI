import { NextRequest, NextResponse } from "next/server";

export async function FetchGitHub(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Error Fetching Repository" },
        { status: 400 }
      );
    }
    const data = await response.json();
    return NextResponse.json({ data: data });
  } catch (error: any) {
    return NextResponse.json({
      error: "Unexpected error",
      detail: error.message,
      status: 500,
    });
  }
}
