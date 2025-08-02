export type GitType = {
  full_name: string;
  description: string;
};
export type PullRequestType = {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  //maybe add diff url?
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
};
export type AIFeedbackPerFile = {
  best_practices: string[];
  potential_bugs_or_regressions: string[];
  security_issues: string[];
};
export type AIFeedbackMap = {
  [filename: string]: AIFeedbackPerFile;
};
export type AIFeedbackType = {
  data: AIFeedbackMap;
  recommendation: string;
  justification: string;
};
export type ModalType = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};
export type Line = {
  type: string;
  content: string;
};
export type DiffFileProps = {
  chunk: string;
  index: number;
  getFilename: (chunk: string) => string;
  parseDiffLines: (chunk: string) => Line[];
  isSelected: boolean;
  onToggle: () => void;
  aiFeedback: AIFeedbackPerFile | undefined;
  modal: boolean;
  toggleModal: (name: string) => void;
  previewOnly?: boolean;
  hasSubmitted?: boolean;
};
