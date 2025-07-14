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
};
export default function DiffFile({
  chunk,
  index,
  getFilename,
  parseDiffLines,
}: DiffFileProps) {
  const [previewOnly, setPreviewOnly] = React.useState(true);
  const filename = getFilename(chunk);
  //   const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(
  //     new Set(filename)
  //   );
  const lines = parseDiffLines(chunk);
  console.log(chunk);

  const visableLines = previewOnly ? lines.slice(0, 10) : lines;

  function renderLines(line: Line, i: number) {
    return (
      <div
        key={i}
        className={
          line.type === "add"
            ? "text-green-600"
            : line.type === "remove"
            ? "text-red-600"
            : line.type === "hunk"
            ? "text-yellow-600 font-bold"
            : "text-gray-800"
        }
      >
        {line.content}
      </div>
    );
  }
  return (
    <div key={index} className="mb-8 border rounded">
      <div className="bg-gray-200 font-mono px-4 py-2 font-semibold flex justify-between">
        {filename}
        {lines.length > 10 && (
          <button className="" onClick={() => setPreviewOnly((val) => !val)}>
            {previewOnly ? (
              <ChevronDownIcon className="w-5 h-5 inline ml-1" />
            ) : (
              <ChevronUpIcon className="w-5 h-5 inline ml-1" />
            )}
          </button>
        )}
      </div>
      <pre className="text-sm font-mono whitespace-pre-wrap px-4 py-2">
        {visableLines.map(renderLines)}
      </pre>
    </div>
  );
}
