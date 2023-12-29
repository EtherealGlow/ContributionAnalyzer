import { UserType } from "../types/github";
import { getAllIssueComments, getCompletedIssues, getIssueAssignee } from "./issue";
import { AssigneeRewardMap } from "../types/miscellaneous";

export async function parseRewards(owner: string, repo: string, issueNumber: number): Promise<AssigneeRewardMap> {
  const rewardMap: AssigneeRewardMap = {};
  const comments = await getAllIssueComments(owner, repo, issueNumber);

  const payComments = comments.filter((comment) => {
    return comment.user.type === UserType.Bot && comment.body.includes("pay.ubq.fi");
  });
  const assignee = await getIssueAssignee(owner, repo, issueNumber);

  payComments.forEach((comment) => {
    if (comment.body.includes("#### Task Assignee Reward")) {
      const match = comment.body.match(/CLAIM (\d+(\.\d+)?)/);
      const reward = match?.[1] ? parseFloat(match[1]) : 0;
      const assigneeOrDefault = assignee || "null";
      const finalReward = isNaN(reward) ? 0 : reward;
      rewardMap[assigneeOrDefault] = (rewardMap[assigneeOrDefault] || 0) + finalReward;
    } else {
      const regex = /(?:\*\*([^:]+):\s*\[ CLAIM ([\d.]+)\s*(\w+) \])/;
      const match = comment.body.match(regex);

      if (match) {
        const username = match[1].trim();
        const reward = match[2].trim();
        rewardMap[username] = (rewardMap[username] || 0) + parseFloat(reward);
      }
    }
  });

  return rewardMap;
}

export async function calculateRepoReward(owner: string, repo: string) {
  const issues = await getCompletedIssues(owner, repo);
  let totalReward: AssigneeRewardMap = {};
  for (let i = 0; i < issues.length; i++) {
    const issueNumber = issues[i].number;
    const reward = await parseRewards(owner, repo, issueNumber);
    totalReward = { ...totalReward, ...reward };
  }
  return totalReward;
}

export async function calculateIssueReward(owner: string, repo: string, issueNumber: number): Promise<AssigneeRewardMap> {
  return await parseRewards(owner, repo, issueNumber);
}
