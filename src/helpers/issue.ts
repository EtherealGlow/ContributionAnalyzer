import { Octokit } from "octokit";
import { Comment } from "../types/github";
import { config } from "dotenv";
config();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getCompletedIssues(owner: string, repo: string) {
  try {
    let page = 1;
    const completedIssues = [];
    let shouldFetch = true;
    // Fetch issues until there are no more pages
    while (shouldFetch) {
      const response = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "closed",
        per_page: 100, // Adjust per_page based on your needs
        page,
      });

      const issuesOnPage = response.data;

      // Break the loop if there are no more pages
      if (!issuesOnPage.length) {
        shouldFetch = false;
      }

      const completedIssue = issuesOnPage.filter((v) => {
        if (v.state_reason == "completed") {
          return v;
        }
      });
      completedIssues.push(...completedIssue);

      page++;
    }

    return completedIssues;
  } catch (error) {
    throw new Error(`Failed to fetch completed issues in ${owner}/${repo}: ${error}`);
  }
}

// eslint-disable-next-line func-style
export const getAllIssueComments = async (
  owner: string,
  repo: string,
  issueNumber: number,
  format: "raw" | "html" | "text" | "full" = "raw"
): Promise<Comment[]> => {
  const result: Comment[] = [];
  let shouldFetch = true;
  let pageNumber = 1;
  try {
    while (shouldFetch) {
      const response = await octokit.rest.issues.listComments({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        per_page: 100,
        page: pageNumber,
        mediaType: {
          format,
        },
      });

      // Fixing infinite loop here, it keeps looping even when its an empty array
      if (response?.data?.length > 0) {
        response.data.forEach((item) => result?.push(item as Comment));
        pageNumber++;
      } else {
        shouldFetch = false;
      }
    }
  } catch (e: unknown) {
    shouldFetch = false;
  }

  return result;
};

export async function getIssueAssignee(owner: string, repo: string, issueNumber: number): Promise<string | undefined> {
  try {
    const response = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    // Extract assignee information from the response
    return response.data.assignee?.login;
  } catch (error) {
    console.error("Error:", error);
  }
}

export function parsePermit(comment: string) {
  const regex = /\(([^)]+)\)/;
  const permit = comment.match(regex);
  if (permit && permit[1]) {
    return permit[1];
  } else {
    console.log("couldnt find permit");
    return "";
  }
}

export async function getOrgRepositories(org: string) {
  try {
    const response = await octokit.request("GET /orgs/{org}/repos", {
      org: org,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const repositories = response.data.map((repo) => repo.name);
    return repositories;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

export async function getUserRepositories(username: string) {
  try {
    const response = await octokit.rest.repos.listForUser({
      username,
    });
    const repositories = response.data.map((repo) => repo.name);
    return repositories;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}
