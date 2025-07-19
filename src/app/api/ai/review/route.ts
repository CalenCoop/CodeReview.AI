import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
export async function POST(request: NextRequest) {
  try {
    const { diff } = await request.json();
    // console.log(diff);
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer reviewing a GitHub pull request. You will receive a unified diff of one or more files. For each file, explain:
            - Potential bugs or regressions
            - Security issues
            - Opportunities to follow best practices or improve code clarity.

           Then, provide a final **recommendation** on whether the PR is:
            - Ready to merge  
            - Needs changes  
            - Cannot determine (insufficient context)

            Justify your decision clearly, based on the diff alone. Group your analysis by file first, then conclude with your recommendation.`,
        },
        {
          role: "user",
          content: diff,
        },
      ],
      temperature: 0.3,
    });
    console.log("completion", completion);
    // const aiResponse = JSON.parse(
    //   completion.choices[0].message.content || "{}"
    // );
    const aiResponse = completion.choices[0].message.content;
    console.log(aiResponse);
    return NextResponse.json({ data: aiResponse, diff: diff });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      { error: "Failed to post request" },
      { status: 500 }
    );
  }
}
