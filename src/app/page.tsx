"use client";
import Image from "next/image";
import React from "react";

type GitType = {
  full_name: string;
  description: string;
};

//TESTING FOR AI CODE REVIEW

export default function Home() {
  const [gitUrl, setGitUrl] = React.useState<string>("");
  const [gitData, setGitData] = React.useState<GitType | null>(null); //set type when we know what is coming back from gitfetch

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
      setGitData(data);
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
    console.log(gitUrl);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Hello World!</h1>
        <div className="form-container">
          <form>
            <input
              type="text"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              placeholder="enter email here"
            />
            <button onClick={handleSubmit}>Submit</button>
          </form>
          <h2>{gitData?.full_name}</h2>
        </div>
      </main>
    </div>
  );
}
