import React, { SetStateAction } from "react";
import { PullRequestType } from "@/lib/types";

type RepoProps = {
  data: PullRequestType;
  isSelected: boolean;
  handleSelectPR: (pr: PullRequestType) => void;
};

export default function Repo({ data, isSelected, handleSelectPR }: RepoProps) {
  const [expanded, setExpanded] = React.useState(false);
  const desc = data.body?.trim() || "";
  const maxLength = 160;

  const isLong = desc.length > maxLength;
  const visableText = expanded ? desc : desc.slice(0, maxLength);

  return (
    <label htmlFor={`radio${data.id}`} className="cursor-pointer block">
      <div className="repo-container grid grid-cols-[5%_20%_20%_1fr] items-start border-2 border-gray-300 p-5 rounded-sm w-auto min-h-10 hover:bg-gray-100 active:bg-gray-200">
        <input
          type="radio"
          id={`radio${data.id}`}
          name="selectedPR"
          value={data.id}
          checked={isSelected}
          onChange={() => handleSelectPR(data)}
          className="self-center"
        />
        <p className="m-1 mr-5 self-center">{data.user.login}</p>
        <p
          className="m-1 mr-5 font-medium text-sm line-clamp-2"
          title={data.title}
        >
          {data.title}
        </p>
        <p className="m-1 text-sm text-gray-700">
          {visableText}
          {isLong && !expanded && "…"}
          {isLong && (
            <button
              type="button"
              className="text-blue-600 hover:underline ml-1"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </p>
      </div>
    </label>
  );
}
