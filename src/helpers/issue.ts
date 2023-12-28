import { Octokit } from "octokit";
const octokit = new Octokit({ auth: "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" });
import { Comment } from "../types/github";

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
