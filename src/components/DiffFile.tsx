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
  const filename = getFilename(chunk);
  const lines = parseDiffLines(chunk);
  return (
    <div key={index} className="mb-8 border rounded">
      <div className="bg-gray-200 font-mono px-4 py-2 font-semibold">
        {filename}
      </div>
      <pre className="text-sm font-mono whitespace-pre-wrap px-4 py-2">
        {lines.map((line, i) => (
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
        ))}
      </pre>
    </div>
  );
}
