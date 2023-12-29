import { Octokit } from "octokit";
const octokit = new Octokit();

export async function checkIfRepoExists(owner: string, repo: string): Promise<boolean> {
  try {
    await octokit.rest.repos.get({ owner, repo });
    return true; // If the repository exists, the request will be successful
  } catch (error) {
    return false;
  }
}
