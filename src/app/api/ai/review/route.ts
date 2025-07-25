import { AIFeedbackMap, AIFeedbackType } from "@/lib/types";
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
          content: `You are a senior software engineer reviewing a GitHub pull request. You will receive a unified diff of one or more files. 
          For each file, explain:
            - Potential bugs or regressions
            - Security issues
            - Opportunities to follow best practices or improve code clarity.

           Then, provide a final **recommendation** on whether the PR is:
            - Ready to merge  
            - Needs changes  
            - Cannot determine (insufficient context)

            Include a justification for your recommendation.
            Respond ONLY with valid JSON in the following format:
            {
                "a/file1.ts": {
                    "potential_bugs_or_regressions": ["Issue 1", "Issue 2"],
                    "security_issues": ["Issue 1"],
                    "best_practices": ["Suggestion 1"]
                },
                "a/file2.ts": {
                    ...
                },
                "recommendation": "Needs changes",
                "justification": "There are potential bugs and security concerns in file1.ts"
            }`,
        },
        {
          role: "user",
          content: diff,
        },
      ],
      temperature: 0.3,
    });
    console.log("completion", completion);
    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Missing content from OpenAI");

    const aiResponse: AIFeedbackType = JSON.parse(content);
    // if (aiResponse) {
    //   try {
    //     const parsed = JSON.parse(aiResponse);
    //     return NextResponse.json({ data: parsed });
    //   } catch (err) {
    //     return NextResponse.json({
    //       raw: aiResponse,
    //       warning: "NON-JSON response, rendering fallback text",
    //     });
    //   }
    // }
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
