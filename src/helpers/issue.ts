import { Octokit } from "octokit";
const octokit = new Octokit();

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
