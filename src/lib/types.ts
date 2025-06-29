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
