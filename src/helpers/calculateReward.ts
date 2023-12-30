import { UserType } from "../types/github";
import { getAllIssueComments, getCompletedIssues, getIssueAssignee, getOrgRepositories } from "./issue";
import { AssigneeRewardMap } from "../types/miscellaneous";

export function mergeRewards(map1: AssigneeRewardMap, map2: AssigneeRewardMap): AssigneeRewardMap {
  const result: AssigneeRewardMap = {};

  // Merge map1 into the result
  for (const assignee in map1) {
    if (map1.hasOwnProperty(assignee)) {
      result[assignee] = {
        reward: (result[assignee]?.reward || 0) + map1[assignee].reward,
        permit: (result[assignee]?.permit || []).concat(map1[assignee].permit),
      };
    }
  }

  // Merge map2 into the result
  for (const assignee in map2) {
    if (map2.hasOwnProperty(assignee)) {
      result[assignee] = {
        reward: (result[assignee]?.reward || 0) + map2[assignee].reward,
        permit: (result[assignee]?.permit || []).concat(map2[assignee].permit),
      };
    }
  }

  return result;
}

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
      const permitComment = comment.html_url;

      if (rewardMap[assigneeOrDefault]) {
        if (rewardMap[assigneeOrDefault].reward) {
          rewardMap[assigneeOrDefault].reward = rewardMap[assigneeOrDefault].reward + finalReward;
        } else {
          rewardMap[assigneeOrDefault].reward = finalReward;
        }

        if (!rewardMap[assigneeOrDefault].permit) {
          rewardMap[assigneeOrDefault].permit = [];
        }

        rewardMap[assigneeOrDefault].permit.push(permitComment);
      } else {
        rewardMap[assigneeOrDefault] = {
          reward: finalReward,
          permit: [permitComment],
        };
      }
    } else {
      const regex = /(?:\*\*([^:]+):\s*\[ CLAIM ([\d.]+)\s*(\w+) \])/;
      const match = comment.body.match(regex);

      if (match) {
        const username = match[1].trim();
        const reward = match[2].trim();
        const permitComment = comment.html_url;

        if (rewardMap[username]) {
          rewardMap[username].reward = (rewardMap[username].reward ?? 0) + parseFloat(reward);

          if (!rewardMap[username].permit) {
            rewardMap[username].permit = [];
          }

          rewardMap[username].permit.push(permitComment);
        } else {
          rewardMap[username] = {
            reward: parseFloat(reward),
            permit: [permitComment],
          };
        }
      }
    }
  });

  return rewardMap;
}

export async function calculateIssueReward(owner: string, repo: string, issueNumber: number): Promise<AssigneeRewardMap> {
  return await parseRewards(owner, repo, issueNumber);
}

export async function calculateRepoReward(owner: string, repo: string) {
  const issues = await getCompletedIssues(owner, repo);
  let totalReward: AssigneeRewardMap = {};
  for (let i = 0; i < issues.length; i++) {
    const issueNumber = issues[i].number;
    const reward = await parseRewards(owner, repo, issueNumber);
    totalReward = mergeRewards(totalReward, reward);
  }
  return totalReward;
}

export async function calculateOrgReward(owner: string) {
  const repos = await getOrgRepositories(owner);
  let totalReward: AssigneeRewardMap = {};
  for (let i = 0; i < repos.length; i++) {
    console.log(repos[i]);
    const reward = await calculateRepoReward(owner, repos[i]);
    totalReward = mergeRewards(totalReward, reward);
  }
  return totalReward;
}
