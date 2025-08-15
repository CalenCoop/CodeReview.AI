"use client";
import React, { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  AIFeedbackMap,
  AIFeedbackType,
  DiffFileProps,
  PullRequestType,
} from "@/lib/types";
import DiffFile from "@/components/DiffFile";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import AiRec from "@/components/AiRec";
import PercentageBar from "@/components/PercentageBar";
import {
  INPUT_BUDGET,
  canAddChunkFactory,
  buildBudgetDiff,
  tokensUsedForSelection,
  percentUsedForSelection,
} from "@/lib/tokens";

export default function ReviewPage() {
  // const [pullRequest, setPullRequest] = React.useState<PullRequestType | null>(
  //   null
  // );
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
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleBackToList = React.useCallback(() => {
    const repoPath = `${params.owner}/${params.repo}`;
    // preserve any existing query params if you want
    const q = new URLSearchParams(searchParams?.toString() ?? "");
    q.set("repo", repoPath);
    router.push(`/?${q.toString()}`);
  }, [params.owner, params.repo, router, searchParams]);

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

  const canAddChunk = React.useMemo(
    () => canAddChunkFactory(filteredChunks, selectedIds, getFilename),
    [filteredChunks, selectedIds]
  );

  // numbers for the bar & button disable
  const tokensUsed = React.useMemo(
    () => tokensUsedForSelection(filteredChunks, selectedIds, getFilename),
    [filteredChunks, selectedIds]
  );

  const percentUsed = React.useMemo(
    () => percentUsedForSelection(filteredChunks, selectedIds, getFilename),
    [filteredChunks, selectedIds]
  );

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

  async function AIFetch() {
    try {
      setLoadingResponse(true);

      const { diff, includedIds, skippedIds, tokensUsed, tokensBudget } =
        buildBudgetDiff(filteredChunks, selectedIds, getFilename);
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

  if (loading) {
    return <h1>Loading....</h1>;
  }
  return (
    <div className="review-container">
      {modalFile && (
        <Modal
          isOpen={modalFile !== null}
          onClose={() => setModalFile(null)}
          modalFile={modalFile}
          modalTab={modalTab}
          setModalTab={setModalTab}
          allChunks={allChunks}
          getFilename={getFilename}
          parseDiffLines={parseDiffLines}
          selectedIds={selectedIds}
          toggleSelected={toggleSelected}
          aiResponse={aiResponse}
        />
      )}
      <button
        type="button"
        onClick={handleBackToList}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        Back to PR list
      </button>

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
        <PercentageBar
          tokensUsed={tokensUsed}
          percentUsed={percentUsed}
          inputBudget={INPUT_BUDGET}
        />
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
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={AIFetch}
              disabled={percentUsed >= 100}
              className={`px-4 py-1 text-sm border rounded-sm self-center 
              ${
                percentUsed >= 100
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
              }`}
            >
              {loadingResponse ? (
                <LoadingSpinner> Loading...</LoadingSpinner>
              ) : (
                "Submit for Review"
              )}
            </button>
            {percentUsed >= 100 && (
              <p className="text-xs text-red-600 mt-1">
                ⚠ Your selection is too large to send in one request. Deselect
                some files to continue.
              </p>
            )}
          </div>
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
