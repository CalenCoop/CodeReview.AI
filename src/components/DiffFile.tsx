import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { AIFeedbackMap, AIFeedbackPerFile } from "@/lib/types";
type Line = {
  type: string;
  content: string;
};
type DiffFileProps = {
  chunk: string;
  index: number;
  getFilename: (chunk: string) => string;
  parseDiffLines: (chunk: string) => Line[];
  isSelected: boolean;
  onToggle: () => void;
  aiFeedback: AIFeedbackPerFile | undefined;
};
export default function DiffFile({
  chunk,
  index,
  getFilename,
  parseDiffLines,
  onToggle,
  isSelected,
  aiFeedback,
}: DiffFileProps) {
  const [previewOnly, setPreviewOnly] = React.useState(true);
  const [showFeedback, setShowFeedback] = React.useState(true);
  const filename = getFilename(chunk);
  const lines = parseDiffLines(chunk);

  const visableLines = previewOnly ? lines.slice(0, 10) : lines;

  function getLineClass(type: string) {
    switch (type) {
      case "add":
        return "text-green-600";
      case "remove":
        return "text-red-600";
      case "hunk":
        return "text-yellow-600 font-bold";
      default:
        return "text-gray-800";
    }
  }

  function renderLines(line: Line, i: number) {
    return (
      <div key={i} className={getLineClass(line.type)}>
        {line.content}
      </div>
    );
  }

  console.log({ name: filename, aiFeedback: aiFeedback });
  return (
    <div
      className={`${
        isSelected ? "border-blue-400" : ""
      } border-1 mb-8 rounded transition-colors duration-200`}
    >
      <div
        className={`${
          isSelected ? "bg-blue-200" : "bg-gray-200"
        } transition-colors duration-200 ease-in-out chunk-title flex justify-between hover:bg-blue-100 active:bg-blue-300`}
      >
        <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 w-10/12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="mr-2"
          />
          {filename}
        </label>
        <div className="font-mono px-4 py-2 font-semibold flex justify-end w-1/6">
          {lines.length > 10 && (
            <button
              className="cursor-pointer"
              onClick={() => setPreviewOnly((val) => !val)}
            >
              {previewOnly ? (
                <ChevronDownIcon className="w-5 h-5 inline ml-1" />
              ) : (
                <ChevronUpIcon className="w-5 h-5 inline ml-1" />
              )}
            </button>
          )}
        </div>
      </div>
      <pre className="text-sm font-mono whitespace-pre-wrap px-4 py-2">
        {visableLines.map(renderLines)}
      </pre>
      {aiFeedback && showFeedback && (
        <div className="bg-gray-100 p-2 mt-2 rounded text-sm">
          <h3 className="font-semibold text-sm text-gray-700">
            🔧 Best Practices
          </h3>
          {/* {aiFeedback.best_practices.join(" ")} */}
          <ul className="list-disc ml-6 space-y-1">
            {aiFeedback.best_practices.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <h3 className="font-semibold text-sm text-gray-700 mt-3">
            🐞 Bugs / Regressions
          </h3>
          {/* {aiFeedback.potential_bugs_or_regressions.join(", ")} */}
          <ul className=" list-disc ml-6 space-y-1">
            {aiFeedback.potential_bugs_or_regressions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <h3 className="font-semibold text-sm text-gray-700 mt-3">
            🔐 Security
          </h3>
          <ul className=" list-disc ml-6 space-y-1">
            {aiFeedback.security_issues.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => setShowFeedback((val) => !val)}>
        {showFeedback ? "Hide" : "Show"} AI Feedback
      </button>
    </div>
  );
}
