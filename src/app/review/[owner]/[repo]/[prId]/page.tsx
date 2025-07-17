"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { PullRequestType } from "@/lib/types";
import DiffFile from "@/components/DiffFile";
import { url } from "inspector";

export default function ReviewPage() {
  const [pullRequest, setPullRequest] = React.useState<PullRequestType | null>(
    null
  );
  const [diff, setDiff] = React.useState<string>("");
  const [filter, setFilter] = React.useState<boolean>(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [aiResponse, setAiResponse] = React.useState<any>(null); //SET TYPE WHEN WE KNOW WHAT WERE GETTING BACK
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

  //kind of redundant having the fetch code again - could make it a hook
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

  const allChunks = diff.split(/^diff --git /gm).filter(Boolean);
  // console.log("chunks", allChunks);

  const getFilename = (chunk: string) => {
    const match = chunk.match(/^a\/(.+?)\s+b\//m);
    return match ? match[1] : "Unknown file";
  };

  const filteredChunks = allChunks.filter((chunk: string) => {
    const filename = getFilename(chunk);
    if (filter) {
      return (
        filename !== "Unknown file" &&
        !filename.startsWith("node_modules/") &&
        !filename.includes("package-lock.json")
      );
    } else {
      return filename !== "Unknown file";
    }
  });

  React.useEffect(() => {
    toggleSelectAllChunks();
  }, [diff]);

  function toggleSelectAllChunks() {
    if (filteredChunks.length !== selectedIds.size) {
      const ids = allChunks
        .map(getFilename)
        .filter(
          (filename: string) =>
            filename !== "Unknown file" &&
            !filename.startsWith("node_modules/") &&
            !filename.includes("package-lock.json")
        );
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  }

  // console.log("filter button", filter);
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

  const githubUrl: string = `https://github.com/${params.owner}/${params.repo}/pull/${params.prId}`;

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const renderChunks = filteredChunks.map((chunk: string, index: number) => {
    const id = getFilename(chunk);
    return (
      <DiffFile
        key={index}
        chunk={chunk}
        index={index}
        getFilename={getFilename}
        parseDiffLines={parseDiffLines}
        isSelected={selectedIds.has(id)}
        onToggle={() => toggleSelected(id)}
      />
    );
  });
  // console.log("diff", diff);
  // console.log("filtered chunks", filteredChunks);
  // console.log("renderchunks", renderChunks);
  // console.log("selected ids", selectedIds);

  // console.log("filtered chunks", filteredChunks.length);

  const joinedFilteredChunks = filteredChunks
    .filter((chunk) => selectedIds.has(getFilename(chunk)))
    .join("\n");
  console.log("filtered for api", joinedFilteredChunks);

  async function AIFetch() {
    try {
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ diff: joinedFilteredChunks }),
      });
      const data = await response.json();
      console.log("data", data);
      setAiResponse(data);
    } catch (error) {
      console.log("error fetching AI response");
    }
  }

  if (loading) {
    return <h1>Loading....</h1>;
  }
  return (
    <div className="review-container">
      <h1>Review Page:</h1>
      <button onClick={AIFetch}>Submit for Review</button>
      <p>{pullRequest?.user.login}</p>
      <nav className="nav-container border-2 flex justify-around color-red-600">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600"
        >
          Open PR in GitHub
        </a>
        <button onClick={() => setFilter((val) => !val)}>
          Show All Content
        </button>
        <button onClick={toggleSelectAllChunks}>
          <span className="">
            {selectedIds.size === filteredChunks.length
              ? "Deselect All"
              : "Select all"}
          </span>
        </button>
      </nav>
      <div className="chunk-container">{renderChunks}</div>
    </div>
  );
}
