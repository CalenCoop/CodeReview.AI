import React from "react";
import { PercentageBarProps } from "@/lib/types";

export default function PercentageBar({
  tokensUsed,
  percentUsed,
  inputBudget,
}: PercentageBarProps) {
  if (percentUsed <= 10) return null;

  return (
    <div className="mt-2 w-full max-w-xl mr-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Review Size</span>
        <span>
          {tokensUsed.toLocaleString()} / {inputBudget.toLocaleString()} est.
          tokens
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${
            percentUsed > 90
              ? "bg-red-500"
              : percentUsed > 75
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
    </div>
  );
}
