"use client";
import Image from "next/image";
import React from "react";

export default function Home() {
  const [gitForm, setGitForm] = React.useState<string>("");

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    console.log(gitForm);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Hello World!</h1>
        <div className="form-container">
          <form>
            <input
              type="text"
              value={gitForm}
              onChange={(e) => setGitForm(e.target.value)}
              placeholder="enter email here"
            />
            <button onClick={handleSubmit}>Submit</button>
          </form>
        </div>
      </main>
    </div>
  );
}
