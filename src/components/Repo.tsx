import React from "react";
import { PullRequestType } from "@/lib/types";

type Props = {
  data: PullRequestType;
};

export default function Repo({ data }: Props) {
  console.log("data on component end", data);
  return (
    <div className="repo-container flex justify-around items-center border-2 border-gray-300 rounded-sm w-lg min-h-10 hover:bg-gray-200 active:bg-gray-400">
      <p>{data.user.login}</p>
      <p>{data.title}</p>
      <p>{data.body}</p>
    </div>
  );
}
