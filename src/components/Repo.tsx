import React, { SetStateAction } from "react";
import { PullRequestType } from "@/lib/types";

type Props = {
  data: PullRequestType;
  //   selectedPr: PullRequestType;
  //   setSelectedPR: React.Dispatch<SetStateAction<PullRequestType>>;
  isSelected: boolean;
  handleSelectPR: (pr: PullRequestType) => void;
};

export default function Repo({ data, isSelected, handleSelectPR }: Props) {
  //   console.log("data on component end", data);
  return (
    <label htmlFor={`radio${data.id}`} className="cursor-pointer block">
      {/* <input
        type="radio"
        id={`radio${data.id}`}
        name="selectedPR"
        value={data.id}
        checked={isSelected}
        onChange={() => handleSelectPR(data)}
      /> */}
      <div className="repo-container grid grid-cols-[5%_20%_20%_1fr] items-center border-2 border-gray-300 p-5 rounded-sm w-auto min-h-10 hover:bg-gray-100 active:bg-gray-200">
        <input
          type="radio"
          id={`radio${data.id}`}
          name="selectedPR"
          value={data.id}
          checked={isSelected}
          onChange={() => handleSelectPR(data)}
        />
        <p className="m-1 mr-5">{data.user.login}</p>
        <p className="m-1 mr-5">{data.title}</p>
        <p className="m-1">{data.body}</p>
      </div>
    </label>
  );
}
