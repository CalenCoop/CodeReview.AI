import { ModalType } from "@/lib/types";
import React from "react";
import DiffFile from "./DiffFile";

export default function Modal({ isOpen, onClose, children }: ModalType) {
  //   const [modalTab, setModalTab] = React.useState<"diff" | "feedback">("diff");
  if (!isOpen) return null;

  const modalRef = React.useRef<HTMLDivElement | null>(null);
  console.log("ref", modalRef);

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
        <div className="modal-children max-h-175 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
