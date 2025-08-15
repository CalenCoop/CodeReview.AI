"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import Repo from "@/components/Repo";
import { pull_requests } from "@/generated/prisma";
import { GitType } from "@/lib/types";
import { createPrerenderParamsForClientSegment } from "next/dist/server/app-render/entry-base";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import React from "react";

type PullRequestType = {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
};

export default function Home() {
  const [gitUrl, setGitUrl] = React.useState<string>("");
  const [gitData, setGitData] = React.useState<GitType | null>(null);
  const [pullRequests, setPullRequests] = React.useState<PullRequestType[]>([]);
  const [selectedPR, setSelectedPR] = React.useState<PullRequestType | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const repoParam = searchParams.get("repo");
    if (!repoParam) return;
    setGitUrl(`https://github.com/${repoParam}`);
    handleGitFetch(`/api/github/pulls?repo=${encodeURIComponent(repoParam)}`);
  }, [searchParams]);

  async function handleGitFetch(url: string) {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || "Failed to load PRs");

      //ensure data is array
      const list = Array.isArray(json?.data) ? json.data : [];

      setPullRequests(list);
    } catch (error: any) {
      setError(error?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  function extractRepoPathFromUrl(url: string): string | null {
    const raw = url.trim();
    //add if missing
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(withProto);
      //require github.com
      if (!/(^|\.)github\.com$/i.test(parsed.hostname)) return null;

      // normalize path (remove extra slashes, trailing slash, and .git)
      const parts = parsed.pathname
        .replace(/\/+/g, "/")
        .replace(/\/$/, "")
        .replace(/\.git$/i, "")
        .split("/")
        .filter(Boolean);
      //want exactly owner/repo
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
      return null;
    } catch (error) {
      console.log("error with extracting Repo from url", error);
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    const repoPath = extractRepoPathFromUrl(gitUrl);
    if (!repoPath) {
      setError(
        "Please enter a valid GitHub repo URL like https://github.com/owner/repo"
      );
      return;
    }
    await handleGitFetch(
      `/api/github/pulls?repo=${encodeURIComponent(repoPath)}`
    );
  }

  function handleSelectPR(pr: PullRequestType) {
    setSelectedPR(pr);
  }
  function fetchSelectedPR() {
    const params = extractRepoPathFromUrl(gitUrl);

    if (!selectedPR?.id || !params) return;
    router.push(`/review/${params}/${selectedPR.number}`);
  }

  const repoElements = (pullRequests ?? []).map((repo) => (
    <Repo
      key={repo.id}
      data={repo}
      handleSelectPR={handleSelectPR}
      isSelected={selectedPR?.id === repo.id}
    />
  ));
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tights">
            CodeReview<span className="text-blue-600">.ai </span>
          </h1>
          {selectedPR && (
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800"
              onClick={fetchSelectedPR}
            >
              Choose Repo for Review
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                GitHub repository URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="Enter Github Repo (ex- https://github.com/facebook/react)"
                  className="w-full rounded-md border px-3 py-2 pr-10 text-sm outline-non focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  🔗
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Paste a repo URL to load open pull requests.
              </p>
            </div>

            <button
              type="submit"
              className="rounded-md bg-green-600 px-4 py-2 text-white text-sm font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <LoadingSpinner> Loading... </LoadingSpinner>
              ) : (
                "Load PRs"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {!loading && pullRequests.length === 0 && !error && (
          <div className="mt-10 rounded-lg border border-dashed bg-white p-10 text-center text-gray-500">
            No pull requests yet. Enter a repo URL above to get started
          </div>
        )}

        {pullRequests.length > 0 && (
          <div className="mt-8 rounded-t-md border bg-white">
            <div className=" grid grid-cols-[5%_20%_20%_1fr] items center border-b px-4 py-2 text-xs font-medium text-gray-500 ">
              <span className="pl-3">Select</span>
              <span className="pl-2">Author</span>
              <span className="pl-2">Title</span>
              <span className="pl-1">Comment</span>
            </div>

            <div className="divide-y">
              {repoElements.length > 0 ? (
                repoElements
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No open PRs found.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
