"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import {
  AIFeedbackMap,
  AIFeedbackType,
  DiffFileProps,
  ModalType,
  PullRequestType,
} from "@/lib/types";
import DiffFile from "@/components/DiffFile";
import { url } from "inspector";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import FeedbackPanel from "@/components/FeedbackPanel";
import AiRec from "@/components/AiRec";

export default function ReviewPage() {
  const [pullRequest, setPullRequest] = React.useState<PullRequestType | null>(
    null
  );
  const [diff, setDiff] = React.useState<string>("");
  const [filter, setFilter] = React.useState<boolean>(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [aiResponse, setAiResponse] = React.useState<AIFeedbackType | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingResponse, setLoadingResponse] = React.useState<boolean>(false);
  const [modalFile, setModalFile] = React.useState<string | null>(null);
  const [modalTab, setModalTab] = React.useState<"diff" | "feedback">("diff");

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

  function canAddChunk(id: string) {
    const currentSelected = filteredChunks
      .filter((chunk) => selectedIds.has(getFilename(chunk)))
      .map((c) => estimateTokens(c))
      .reduce((a, b) => a + b, 0);
    const adding = estimateTokens(
      filteredChunks.find((c) => getFilename(c) === id) || ""
    );
    return currentSelected + adding <= INPUT_BUDGET;
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      } else {
        if (!canAddChunk(id)) {
          alert(
            "Adding this file would exceed the review size limit. Try deselecting another file first."
          );
          return prev;
        }
        next.add(id);
        return next;
      }
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
        aiFeedback={aiResponse?.data[id]}
        modal={modalFile !== null}
        toggleModal={toggleModal}
        hasSubmitted={!!aiResponse}
      />
    );
  });

  const joinedFilteredChunks = React.useMemo(() => {
    return filteredChunks
      .filter((chunk) => selectedIds.has(getFilename(chunk)))
      .join("\n");
  }, [filteredChunks, selectedIds]);

  const MODEL_TOKEN_LIMIT = 30000; //leave room for the model's reply
  const OUTPUT_BUDGET = 2000; // room for system message
  const SYSTEM_PROMPT_BUDGET = 2000; //
  const INPUT_BUDGET = MODEL_TOKEN_LIMIT - OUTPUT_BUDGET - SYSTEM_PROMPT_BUDGET;
  const estimateTokens = (s: string) => Math.ceil(s.length / 4);

  function buildBudgetDiff(
    filteredChunks: string[],
    isSelected: (id: string) => boolean,
    getFilename: (chunk: string) => string
  ) {
    //collect selected chunks with sizes
    const selected = filteredChunks
      .filter((chunk) => isSelected(getFilename(chunk)))
      .map((chunk) => ({
        id: getFilename(chunk),
        text: chunk,
        tokens: estimateTokens(chunk),
      }))
      .sort((a, b) => a.tokens - b.tokens); //take out if we dont want to prefer smaller chunks over bigger ones
    let used = 0;
    const included: string[] = [];
    const includedIds: string[] = [];
    const skippedIds: string[] = [];

    for (const { id, text, tokens } of selected) {
      if (used + tokens <= INPUT_BUDGET) {
        included.push(text);
        includedIds.push(id);
        used += tokens;
      } else {
        skippedIds.push(id);
      }
    }
    return {
      diff: included.join("\n"),
      includedIds,
      skippedIds,
      tokensUsed: used,
      tokensBudget: INPUT_BUDGET,
    };
  }

  async function AIFetch() {
    try {
      setLoadingResponse(true);

      const { diff, includedIds, skippedIds, tokensUsed, tokensBudget } =
        buildBudgetDiff(
          filteredChunks,
          (id) => selectedIds.has(id),
          getFilename
        );
      if (!diff) {
        alert(
          "Your selection is too large to send in one request. Try selecting smaller or fewer files."
        );
        setLoadingResponse(false);
        return;
      }
      if (skippedIds.length > 0) {
        console.warn(
          `⚠️ Skipped ${skippedIds.length} file(s) due to size:`,
          skippedIds
        );
      }

      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ diff: diff }),
      });
      const fullResponse = await response.json();
      const { data: aiData } = fullResponse;
      setAiResponse(aiData);
    } catch (error) {
      console.log("error fetching AI response");
    }
    setLoadingResponse(false);
  }

  function toggleModal(name: string): React.SetStateAction<string | void> {
    setModalFile(name);
  }
  const tokensUsed = filteredChunks
    .filter((chunk) => selectedIds.has(getFilename(chunk)))
    .map((c) => estimateTokens(c))
    .reduce((a, b) => a + b, 0);
  const percentUsed = Math.min(
    100,
    Math.round((tokensUsed / INPUT_BUDGET) * 100)
  );
  console.log("percentage used", percentUsed, "tokens", tokensUsed);
  if (loading) {
    return <h1>Loading....</h1>;
  }
  return (
    <div className="review-container">
      {modalFile && (
        <Modal isOpen={modalFile !== null} onClose={() => setModalFile(null)}>
          <div className="flex border-b mb-4 space-x-2">
            <button
              className={`px-4 py-2 rounded-t-md font-semibold transition-colors ${
                modalTab === "diff"
                  ? "bg-white border border-b-0 border-blue-500 text-blue-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setModalTab("diff")}
            >
              🧾 Code Diff
            </button>
            <button
              className={`px-4 py-2 rounded-t-md font-semibold transition-colors ${
                modalTab === "feedback"
                  ? "bg-white border border-b-0 border-blue-500 text-blue-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setModalTab("feedback")}
            >
              💬 AI Feedback
            </button>
          </div>
          {/* make modal its own component instead of having it inline here */}
          {modalTab === "diff" ? (
            <DiffFile
              chunk={
                allChunks.find((chunk) => getFilename(chunk) === modalFile)!
              }
              index={0}
              getFilename={getFilename}
              parseDiffLines={parseDiffLines}
              isSelected={selectedIds.has(modalFile)}
              onToggle={() => toggleSelected(modalFile)}
              aiFeedback={aiResponse?.data[modalFile]}
              modal={modalFile !== null}
              toggleModal={toggleModal}
              previewOnly={false}
            />
          ) : (
            <FeedbackPanel
              aiFeedback={
                aiResponse?.data[modalFile ?? ""] ?? {
                  potential_bugs_or_regressions: [],
                  security_issues: [],
                  best_practices: ["✅ No feedback found for this file."],
                }
              }
            />
          )}
        </Modal>
      )}
      <nav className="nav-container border-b flex justify-between mt-2 mb-3 p-3">
        <div className="left-side-nav">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 mr-3"
          >
            🔗 Open PR on GitHub
          </a>

          <span className="text-gray-500 text-sm">{`${selectedIds.size} of ${renderChunks.length} files selected`}</span>
        </div>
        {percentUsed > 10 && (
          <div className="mt-2 w-full max-w-xl">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Review Size</span>
              <span>
                {tokensUsed.toLocaleString()} / {INPUT_BUDGET.toLocaleString()}{" "}
                est. tokens
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className={`h-2 rounded ${
                  percentUsed > 90
                    ? "bg-red-500"
                    : percentUsed > 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            className="px-4 py-1 text-sm border rounded-sm self-center hover:bg-gray-100 active:bg-gray-200"
            onClick={() => setFilter((val) => !val)}
          >
            {filter ? "Show All Files" : "Filter Content"}
          </button>
          <button
            className="px-4 py-1 text-sm border rounded-sm self-center hover:bg-gray-100 active:bg-gray-200"
            onClick={toggleSelectAllChunks}
          >
            <span className="">
              {selectedIds.size === filteredChunks.length
                ? "Deselect All"
                : "Select all"}
            </span>
          </button>
          <button
            onClick={AIFetch}
            className="px-4 py-1 text-sm border rounded-sm bg-green-600 text-white hover:bg-green-700 active:bg-green-800 self-center"
          >
            {loadingResponse ? (
              <LoadingSpinner> Loading...</LoadingSpinner>
            ) : (
              "Submit for Review"
            )}
          </button>
        </div>
      </nav>

      {!aiResponse ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded p-4 mt-4 mb-4">
          <p>
            <strong>Select</strong> which files you’d like to review using the
            checkboxes, or <em>submit all filtered files</em> for feedback.
            Click a file to preview before submitting.
          </p>
        </div>
      ) : (
        <AiRec
          recommendation={aiResponse.recommendation}
          justification={aiResponse.justification}
        />
      )}
      {renderChunks}
    </div>
  );
}
