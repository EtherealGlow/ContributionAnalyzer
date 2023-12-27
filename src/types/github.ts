export interface GitHubIssue {
  user: { login: string };
  labels: { name: string }[];
}
export interface Label {
  id?: number | undefined;
  node_id?: string | undefined;
  url?: string | undefined;
  name?: string | undefined;
  description?: string | null | undefined;
  color?: string | null | undefined;
  default?: boolean | undefined;
}
