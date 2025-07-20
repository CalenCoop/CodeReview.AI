import React from "react";
type LoadingSpinnerProps = {
  children?: React.ReactNode;
};

export default function LoadingSpinner({ children }: LoadingSpinnerProps) {
  return (
    <div className="LoadingSpinner-container flex items-center">
      <span className="mr-3">{children}</span>
      <div className="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
