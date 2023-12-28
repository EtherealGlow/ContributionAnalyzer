import { Type, Static } from "@sinclair/typebox";

export enum UserType {
  User = "User",
  Bot = "Bot",
  Organization = "Organization",
}

const userSchema = Type.Object({
  login: Type.String(),
  id: Type.Number(),
  node_id: Type.String(),
  avatar_url: Type.String(),
  gravatar_id: Type.String(),
  url: Type.String(),
  html_url: Type.String(),
  followers_url: Type.String(),
  following_url: Type.String(),
  gists_url: Type.String(),
  starred_url: Type.String(),
  subscriptions_url: Type.String(),
  organizations_url: Type.String(),
  repos_url: Type.String(),
  events_url: Type.String(),
  received_events_url: Type.String(),
  type: Type.Enum(UserType),
  site_admin: Type.Boolean(),
});

export const commentSchema = Type.Object({
  url: Type.String(),
  html_url: Type.String(),
  issue_url: Type.String(),
  id: Type.Number(),
  node_id: Type.String(),
  user: userSchema,
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" }),
  author_association: Type.String(),
  body: Type.String(),
  body_html: Type.Optional(Type.String()),
  body_text: Type.Optional(Type.String()),
});

export type Comment = Static<typeof commentSchema>;
