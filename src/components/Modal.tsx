import { ReviewModalProps } from "@/lib/types";
import React from "react";
import DiffFile from "./DiffFile";
import FeedbackPanel from "@/components/FeedbackPanel";

export default function Modal({
  isOpen,
  onClose,
  modalFile,
  modalTab,
  setModalTab,
  allChunks,
  getFilename,
  parseDiffLines,
  selectedIds,
  toggleSelected,
  aiResponse,
}: ReviewModalProps) {
  if (!isOpen) return null;

  const modalRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-md shadow-lg p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>
        <div className="flex border-b mb-4 space-x-2">
          <button
            className={`px-4 py-2 rounded-t-md font-semibold transition-colors ${
              modalTab === "diff"
                ? "bg-white border border-b-0 border-blue-500 text-blue-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            onClick={() => setModalTab("diff")}
          >
            🧾 Code Diff
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-semibold transition-colors ${
              modalTab === "feedback"
                ? "bg-white border border-b-0 border-blue-500 text-blue-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            onClick={() => setModalTab("feedback")}
          >
            💬 AI Feedback
          </button>
        </div>

        {modalTab === "diff" ? (
          <DiffFile
            chunk={allChunks.find((chunk) => getFilename(chunk) === modalFile)!}
            index={0}
            getFilename={getFilename}
            parseDiffLines={parseDiffLines}
            isSelected={selectedIds.has(modalFile)}
            onToggle={() => toggleSelected(modalFile)}
            aiFeedback={aiResponse?.data[modalFile]}
            modal={true}
            toggleModal={() => {}}
            previewOnly={false}
          />
        ) : (
          <FeedbackPanel
            aiFeedback={
              aiResponse?.data[modalFile ?? ""] ?? {
                potential_bugs_or_regressions: [],
                security_issues: [],
                best_practices: ["✅ No feedback found for this file."],
              }
            }
          />
        )}
      </div>
    </div>
  );
}
