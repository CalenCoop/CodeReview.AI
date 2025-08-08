import { AIFeedbackPerFile } from "@/lib/types";
import React from "react";
type AiRecType = {
  recommendation: string;
  justification: string;
};
export default function AiRec({ recommendation, justification }: AiRecType) {
  console.log("rec from component side", recommendation);
  const bgColor =
    recommendation === "Needs changes"
      ? "bg-yellow-100 text-yellow-800"
      : recommendation === "Ready to merge"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  return (
    <p className={`p-4 rounded border m-5 ${bgColor}`}>
      <strong> {recommendation}</strong>: {justification}
    </p>
  );
}
