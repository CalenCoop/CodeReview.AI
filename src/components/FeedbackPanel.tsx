import { AIFeedbackPerFile } from "@/lib/types";
import React from "react";
import FeedbackSection from "./FeedbackSection";
export default function FeedbackPanel({
  aiFeedback,
}: {
  aiFeedback?: AIFeedbackPerFile;
}) {
  if (!aiFeedback) return <p>No feedback available</p>;
  return (
    <div className="rounded border border-gray-200 p-4 bg-white shadow-sm space-y-4">
      <FeedbackSection
        title="🔧 Best Practices"
        items={aiFeedback.best_practices}
      />
      <FeedbackSection
        title="🐞 Bugs / Regressions"
        items={aiFeedback.potential_bugs_or_regressions}
      />
      <FeedbackSection
        title="🔐 Security Issues"
        items={aiFeedback.security_issues}
      />
    </div>
  );
}
