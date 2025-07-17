import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
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
};
export default function DiffFile({
  chunk,
  index,
  getFilename,
  parseDiffLines,
  onToggle,
  isSelected,
}: DiffFileProps) {
  const [previewOnly, setPreviewOnly] = React.useState(true);
  const filename = getFilename(chunk);
  const lines = parseDiffLines(chunk);
  //   console.log(chunk);

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
  return (
    <div className="mb-8 border rounded">
      <div className="chunk-title flex bg-gray-200 justify-between">
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
    </div>
  );
}
