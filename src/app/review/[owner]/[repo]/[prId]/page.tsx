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

const tempData = {
  data: {
    "a/src/app/api/auth/[...nextauth]/route.ts": {
      potential_bugs_or_regressions: [],
      security_issues: [],
      best_practices: [],
    },
    "a/src/app/api/github/diff/route.ts": {
      potential_bugs_or_regressions: [
        "No validation or sanitization of 'repo' and 'num' parameters, which could lead to malformed URLs or unintended API calls.",
        "Directly interpolates user input into the GitHub API URL, which could cause errors or unexpected behavior if the input is malformed.",
      ],
      security_issues: [
        "Potential for SSRF (Server-Side Request Forgery) if an attacker can manipulate 'repo' or 'num' to point to a different host or path, depending on how FetchGitHub is implemented.",
      ],
      best_practices: [
        "Validate and sanitize input parameters before using them in URLs.",
        "Consider using stricter typing or regex to ensure 'repo' and 'num' are in expected formats.",
      ],
    },
    "a/src/app/api/github/pull/route.ts": {
      potential_bugs_or_regressions: [],
      security_issues: [],
      best_practices: [
        "Remove commented-out code before merging to keep the codebase clean.",
      ],
    },
    "a/src/app/api/github/pulls/route.ts": {
      potential_bugs_or_regressions: [
        "No validation or sanitization of 'repo' parameter before using it in the GitHub API URL.",
      ],
      security_issues: [
        "Potential SSRF if 'repo' is manipulated to inject malicious content into the URL.",
      ],
      best_practices: [
        "Validate and sanitize 'repo' parameter.",
        "Consider error handling for FetchGitHub failures.",
      ],
    },
    "a/src/app/api/github/review/route.ts": {
      potential_bugs_or_regressions: [
        "No validation or sanitization of 'owner', 'repo', or 'prId' parameters before interpolating into the URL.",
        "No check for response.ok before calling response.text(), which could result in misleading output if the fetch fails.",
      ],
      security_issues: [
        "Potential SSRF via user-controlled 'owner', 'repo', or 'prId' parameters.",
      ],
      best_practices: [
        "Validate and sanitize all input parameters.",
        "Check response.ok before using the response.",
        "Consider rate limiting or authentication to prevent abuse.",
      ],
    },
    "a/src/app/page.tsx": {
      potential_bugs_or_regressions: [
        "No error handling if extractRepoPathFromUrl returns null; handleGitFetch will be called with an invalid URL.",
        "gitData is fetched but not set (setGitData is commented out), so <h2>{gitData?.full_name}</h2> will always be empty.",
      ],
      security_issues: [],
      best_practices: [
        "Add error handling for invalid URLs.",
        "Remove commented-out code.",
        "Consider disabling the submit button if the input is invalid.",
      ],
    },
    "a/src/app/review/[owner]/[repo]/[prId]/page.tsx": {
      potential_bugs_or_regressions: [
        "toggleSelectAllChunks logic may not behave as expected if filteredChunks changes after selection.",
        "No error handling for failed fetches in handleGitFetch or AIFetch beyond logging to console.",
        "aiResponse is typed as 'any' and not validated before rendering.",
      ],
      security_issues: [],
      best_practices: [
        "Add error handling and user feedback for failed fetches.",
        "Type aiResponse properly once the API response shape is known.",
        "Consider memoizing getFilename or parseDiffLines if performance becomes an issue.",
      ],
    },
    "a/src/components/DiffFile.tsx": {
      potential_bugs_or_regressions: [],
      security_issues: [],
      best_practices: [
        "Consider using React.memo if DiffFile is rendered many times for performance.",
        "Use more descriptive prop names (e.g., 'isPreviewOnly' instead of 'previewOnly').",
      ],
    },
    "a/src/components/Repo.tsx": {
      potential_bugs_or_regressions: [],
      security_issues: [],
      best_practices: [
        "Remove commented-out code.",
        "Consider accessibility improvements for radio inputs (e.g., ARIA attributes).",
      ],
    },
    "a/src/lib/auth.ts": {
      potential_bugs_or_regressions: [],
      security_issues: [],
      best_practices: [],
    },
    "a/src/lib/github.ts": {
      potential_bugs_or_regressions: [
        "No authentication or rate limiting when calling the GitHub API, which could lead to hitting rate limits or leaking sensitive data.",
        "No validation of the input URL.",
      ],
      security_issues: [
        "Potential SSRF if the input URL is not strictly controlled.",
      ],
      best_practices: [
        "Validate and sanitize the input URL.",
        "Consider adding authentication when calling the GitHub API.",
      ],
    },
    "a/src/lib/openai.ts": {
      potential_bugs_or_regressions: [],
      security_issues: [],
      best_practices: [],
    },
    "a/src/lib/types.ts": {
      potential_bugs_or_regressions: [],
      security_issues: [],
      best_practices: [],
    },
  },
  recommendation: "Needs changes",
  justification:
    "There are several potential security issues (notably SSRF) and missing input validation in the API routes that accept user-supplied parameters and use them to construct URLs for server-side fetches. These must be addressed before merging. Additionally, there are some best practice improvements and minor bugs to fix, such as error handling and removal of commented-out code.",
};

export default function ReviewPage() {
  const [pullRequest, setPullRequest] = React.useState<PullRequestType | null>(
    null
  );
  const [diff, setDiff] = React.useState<string>("");
  const [filter, setFilter] = React.useState<boolean>(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  // const [aiResponse, setAiResponse] = React.useState<AIFeedbackType | null>(
  //   null
  // );
  const [aiResponse, setAiResponse] = React.useState<AIFeedbackType | null>(
    tempData
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
  // console.log(
  //   "testing",
  //   aiResponse?.data["a/src/app/api/github/diff/route.ts"]
  // );
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
        aiFeedback={aiResponse?.data[`a/${id}`]}
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

  // console.log("filtered for api", joinedFilteredChunks);

  async function AIFetch() {
    try {
      setLoadingResponse(true);
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
    setLoadingResponse(false);
  }

  function toggleModal(name: string): React.SetStateAction<string | void> {
    setModalFile(name);
  }
  // console.log("modal name", modalFile);
  // console.log("chunk check", renderChunks.length);

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
              aiFeedback={aiResponse?.data[`a/${modalFile}`]}
              modal={modalFile !== null}
              toggleModal={toggleModal}
              previewOnly={false}
            />
          ) : (
            <FeedbackPanel aiFeedback={aiResponse?.data[`a/${modalFile}`]} />
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

      {/* Add a contintional here with aiResponse.
    !aiResponse ?  Select files... : AiRecommendation  */}
      {!aiResponse ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded p-4 mt-4 mb-4">
          <p>
            <strong>Select</strong> which files you’d like to review using the
            checkboxes, or <em>submit all filtered files</em> for feedback.
            Click a file to preview before submitting.
          </p>
        </div>
      ) : (
        // make this a component - different colors based on response/rec
        <p>
          <strong> {aiResponse.recommendation}</strong>:{" "}
          {aiResponse.justification}
        </p>
      )}
      {renderChunks}
    </div>
  );
}
