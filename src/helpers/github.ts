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

export async function userExists(username: string) {
  try {
    const response = await octokit.rest.users.getByUsername({
      username: username,
    });
    return response.status === 200;
  } catch (error) {
    console.log("Couldnt find user");
    return false;
  }
}
