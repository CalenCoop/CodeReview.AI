import { AIFeedbackMap, AIFeedbackType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
export async function POST(request: NextRequest) {
  try {
    const { diff } = await request.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      response_format: { type: "json_object" },
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
            - Needs Changes  
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

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Missing content from OpenAI");

    const raw = JSON.parse(content);
    const { recommendation, justification, ...rest } = raw;

    const cleaned: Record<string, AIFeedbackMap> = {};
    for (const key in rest) {
      const cleanKey = key.replace(/^a\//, "").replace(/^b\//, "");
      cleaned[cleanKey] = rest[key];
    }

    const aiResponse: AIFeedbackType = {
      data: cleaned,
      recommendation,
      justification,
    };

    return NextResponse.json({ data: aiResponse, diff });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      { error: "Failed to post request" },
      { status: 500 }
    );
  }
}
