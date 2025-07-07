"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { PullRequestType } from "@/lib/types";

useParams;

export default function ReviewPage() {
  const [pullRequest, setPullRequest] = React.useState<PullRequestType | null>(
    null
  );
  const [diff, setDiff] = React.useState<any>(""); //CHANGE TYPE
  const [loading, setLoading] = React.useState<boolean>(false);

  const params = useParams<{
    owner: string;
    repo: string;
    prId: string;
  }>();
  React.useEffect(() => {
    if (params?.owner && params?.repo && params?.prId) {
      handleGitFetch(params.owner, params.repo, params.prId);
    }
  }, [params]);
  console.log("loading", loading);

  //kind of redundant having the fetch code again -could make it a hook
  async function handleGitFetch(
    owner: string,
    repo: string,
    prId: string
  ): Promise<void> {
    const url = `/api/github/review?owner=${owner}&repo=${repo}&prId=${prId}`;
    try {
      setLoading(true);
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });
      const diffText = await response.text();
      setDiff(diffText);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const fileChunks = diff.split(/^diff --git /gm).filter(Boolean);
  console.log("chunks", fileChunks);

  const getFilename = (chunk: string) => {
    const match = chunk.match(/^a\/(.+?)\s+b\//m);
    return match ? match[1] : "Unknown file";
  };

  const parseDiffLines = (chunk: string) => {
    const lines = chunk.split("\n");
    const classifiedLines = lines.map((line) => {
      if (line.startsWith("+") && !line.startsWith("+++"))
        return { type: "add", content: line };
      if (line.startsWith("-") && !line.startsWith("---"))
        return { type: "remove", content: line };
      if (line.startsWith("@@")) return { type: "hunk", content: line };
      return { type: "context", content: line };
    });
    return classifiedLines;
  };

  if (loading) {
    return <h1>Loading....</h1>;
  }

  return (
    <div className="review-container">
      <h1>Review Page:</h1>
      <p>{pullRequest?.user.login}</p>

      {fileChunks.map((chunk: string, index: number) => {
        const filename = getFilename(chunk);
        const lines = parseDiffLines(chunk);

        return (
          <div key={index} className="mb-8 border rounded">
            <div className="bg-gray-200 font-mono px-4 py-2 font-semibold">
              {filename}
            </div>
            <pre className="text-sm font-mono whitespace-pre-wrap px-4 py-2">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.type === "add"
                      ? "text-green-600"
                      : line.type === "remove"
                      ? "text-red-600"
                      : line.type === "hunk"
                      ? "text-yellow-600 font-bold"
                      : "text-gray-800"
                  }
                >
                  {line.content}
                </div>
              ))}
            </pre>
          </div>
        );
      })}
    </div>
  );
}
