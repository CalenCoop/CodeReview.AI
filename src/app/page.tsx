"use client";
import Repo from "@/components/Repo";
import { pull_requests } from "@/generated/prisma";
import { GitType } from "@/lib/types";
import Image from "next/image";
import React from "react";

type PullRequestType = {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  //maybe add diff url?
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

  async function handleGitFetch(url: string) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
        },
        // body: JSON.stringify({ username: "Calen" }),
      });
      const data = await response.json();
      console.log("data", data);
      // setGitData(data);
      setPullRequests(data.data);
    } catch (error) {
      console.log(error);
    }
  }
  function extractRepoPathFromUrl(url: string) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== "github.com") return null;
      const splitUrl = parsed.pathname.split("/").filter(Boolean);
      if (splitUrl.length >= 2) {
        console.log("params are ", `${splitUrl[0]}/${splitUrl[1]}`);
        return `${splitUrl[0]}/${splitUrl[1]}`;
      }
      return null;
    } catch (error) {
      console.log("error with extracting Repo from url", error);
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const params = extractRepoPathFromUrl(gitUrl);

    handleGitFetch(`/api/github/pulls?repo=${params}`);
    // console.log(gitUrl);
  }
  // console.log("pull requests", pullRequests);

  function handleSelectPR(pr: PullRequestType) {
    setSelectedPR(pr);
    console.log("selected pr", selectedPR);
  }

  const repoElements = pullRequests.map((repo) => (
    <Repo
      key={repo.id}
      data={repo}
      handleSelectPR={handleSelectPR}
      isSelected={selectedPR?.id === repo.id}
    />
  ));
  console.log("selected pr", selectedPR);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Hello World!</h1>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              placeholder="Enter Github Repo "
              className="min-w-xl mr-2 border-1 rounded-sm h-8"
            />
            <button
              type="submit"
              className="border-2 rounded-lg p-1 bg-green-600 text-white h-9 hover:bg-green-700 active:bg-green-800"
            >
              Submit
            </button>
          </form>
          {selectedPR && (
            <button
              type="submit"
              className="border-2 rounded-lg bg-blue-600 text-white h-9 p-5  flex items-center"
              onClick={() => console.log("hello")}
            >
              Choose Repo for Review
            </button>
          )}
          <h2>{gitData?.full_name}</h2>
        </div>
        {repoElements.length > 0 && (
          <div className="repo-headers grid grid-cols-[20%_25%_1fr] rounded-sm w-full border-2 pl-5 pr-5">
            <span className="block"> Name</span>
            <span className="block"> Title</span>
            <span className="block"> Description</span>
          </div>
        )}
        <div className="repos">
          <form action="">{repoElements}</form>
        </div>
      </main>
    </div>
  );
}
