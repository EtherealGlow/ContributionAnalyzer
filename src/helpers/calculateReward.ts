import { UserType } from "../types/github";
import { getAllIssueComments, getCompletedIssues, getOrgRepositories } from "./issue";
import { AssigneeRewardMap } from "../types/miscellaneous";
import { getUserFromWalletAddr } from "../adapters/supabase/helpers";

export function mergeRewards(map1: AssigneeRewardMap, map2: AssigneeRewardMap): AssigneeRewardMap {
  console.log("Merging rewards...");
  const result: AssigneeRewardMap = {};

  for (const assignee in map1) {
    if (map1.hasOwnProperty(assignee)) {
      console.log(`Merging rewards for assignee ${assignee} from map1`);
      result[assignee] = {
        reward: (result[assignee]?.reward || 0) + map1[assignee].reward,
        permit: (result[assignee]?.permit || []).concat(map1[assignee].permit),
      };
    }
  }

  for (const assignee in map2) {
    if (map2.hasOwnProperty(assignee)) {
      console.log(`Merging rewards for assignee ${assignee} from map2`);
      result[assignee] = {
        reward: (result[assignee]?.reward || 0) + map2[assignee].reward,
        permit: (result[assignee]?.permit || []).concat(map2[assignee].permit),
      };
    }
  }

  console.log("Rewards merged successfully.");
  return result;
}

export async function parseRewards(owner: string, repo: string, issueNumber: number): Promise<AssigneeRewardMap> {
  console.log(`Parsing rewards for owner ${owner}, repo ${repo}, issue number ${issueNumber}`);
  const rewardMap: AssigneeRewardMap = {};
  const comments = await getAllIssueComments(owner, repo, issueNumber);

  const payComments = comments.filter((comment) => {
    return comment.user.type === UserType.Bot && comment.body.includes("pay.ubq.fi");
  });

  for (const comment of payComments) {
    const match = comment.body.match(/\(([^)]+)\)/);
    if (match) {
      const permitUrl = match[1] ?? "";
      const claimParam = new URLSearchParams(permitUrl).get("https://pay.ubq.fi?claim") ?? "";
      const claimData = JSON.parse(Buffer.from(claimParam, "base64").toString("binary"));
      const bountyWinner = (await getUserFromWalletAddr(claimData.transferDetails.to)) ?? "";
      const amountWon = Number(claimData.transferDetails.requestedAmount) / 10 ** 18; // Fix exponentiation
      const githubPermitComment = comment.html_url;

      if (rewardMap[bountyWinner]) {
        if (rewardMap[bountyWinner].reward) {
          rewardMap[bountyWinner].reward += amountWon; // Fix increment
        } else {
          rewardMap[bountyWinner].reward = amountWon;
        }

        if (!rewardMap[bountyWinner].permit) {
          rewardMap[bountyWinner].permit = [];
        }

        rewardMap[bountyWinner].permit.push(githubPermitComment);
      } else {
        rewardMap[bountyWinner] = {
          reward: amountWon,
          permit: [githubPermitComment],
        };
      }
    }
  }

  console.log("Rewards parsed successfully.");
  return rewardMap;
}
export async function calculateIssueReward(owner: string, repo: string, issueNumber: number): Promise<AssigneeRewardMap> {
  console.log(`Calculating issue reward for owner ${owner}, repo ${repo}, issue number ${issueNumber}`);
  const reward = await parseRewards(owner, repo, issueNumber);
  console.log("Issue reward calculated successfully.");
  return reward;
}

export async function calculateRepoReward(owner: string, repo: string) {
  console.log(`Calculating repo reward for owner ${owner}, repo ${repo}`);
  const issues = await getCompletedIssues(owner, repo);
  let totalReward: AssigneeRewardMap = {};
  for (let i = 0; i < issues.length; i++) {
    const issueNumber = issues[i].number;
    console.log(`Calculating reward for issue number ${issueNumber}`);
    const reward = await parseRewards(owner, repo, issueNumber);
    totalReward = mergeRewards(totalReward, reward);
  }
  console.log("Repo reward calculated successfully.");
  return totalReward;
}

export async function calculateOrgReward(owner: string) {
  console.log(`Calculating organization reward for owner ${owner}`);
  const repos = await getOrgRepositories(owner);
  let totalReward: AssigneeRewardMap = {};
  for (let i = 0; i < repos.length; i++) {
    console.log(`Calculating reward for repo ${repos[i]}`);
    const reward = await calculateRepoReward(owner, repos[i]);
    totalReward = mergeRewards(totalReward, reward);
  }
  console.log("Organization reward calculated successfully.");
  return totalReward;
}
