import { AIFeedbackPerFile } from "@/lib/types";
import React from "react";
type FeedackSectionType = {
  title: string;
  items: string[];
};
export default function FeedbackSection({ title, items }: FeedackSectionType) {
  if (items.length === 0) return null;
  return (
    <div className="text-gray-700">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-1">
        {title}
      </h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
