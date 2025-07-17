import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { diff } = await request.json();
    console.log(request);
    return NextResponse.json({ data: diff });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to post request" },
      { status: 500 }
    );
  }
}
