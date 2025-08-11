import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import {
  AIFeedbackMap,
  AIFeedbackPerFile,
  DiffFileProps,
  Line,
} from "@/lib/types";

export default function DiffFile({
  chunk,
  index,
  getFilename,
  parseDiffLines,
  onToggle,
  isSelected,
  aiFeedback,
  modal,
  toggleModal,
  previewOnly,
  hasSubmitted,
}: DiffFileProps) {
  const [previewOnlyState, setPreviewOnlyState] = React.useState(true);
  const [showFeedback, setShowFeedback] = React.useState(true);
  const filename = getFilename(chunk);
  const lines = parseDiffLines(chunk);

  const shouldPreview = previewOnly ?? previewOnlyState;
  const visableLines = shouldPreview ? lines.slice(0, 10) : lines;

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
  const bugs = aiFeedback?.potential_bugs_or_regressions.length || 0;
  const sec = aiFeedback?.security_issues.length || 0;
  const best = aiFeedback?.best_practices.length || 0;
  return (
    <div
      className={`p-4 mb-3 rounded transition-colors duration-200 hover:shadow border-1 border-blue-400 cursor-pointer ${
        isSelected ? "border-blue-400" : ""
      } ${
        hasSubmitted ? "border" : isSelected ? "border-blue-400 bg-blue-50" : ""
      }`}
    >
      <div
        className={`transition-colors duration-200 ease-in-out chunk-title flex justify-between `}
      >
        <div onClick={() => toggleModal(filename)}>
          <div className="flex items-center space-x-1">
            {hasSubmitted && <span>✅</span>}
            <span className="text-sm font-mono text-gray-800">{filename}</span>
          </div>
          {!modal && (
            <p className="text-xs text-gray-500 mt-1">Click to preview diff</p>
          )}
        </div>

        <div>
          {!hasSubmitted && !modal && (
            <label className="flex items-center space-x-2  px-4 py-2 w-10/12">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggle}
                className="mr-2 cursor-pointer"
              />
            </label>
          )}
          <div className="flex space-x-2 text-xs">
            {bugs > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                🐞 {bugs}
              </span>
            )}
            {sec > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                🔐 {sec}
              </span>
            )}
            {best > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                ✔️ {best}
              </span>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <pre className="text-sm font-mono whitespace-pre-wrap px-4 py-2">
          {visableLines.map(renderLines)}
        </pre>
      )}
    </div>
  );
}
