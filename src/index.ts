import { calculateIssueReward, calculateOrgReward, calculateRepoReward } from "./helpers/calculateReward";
import { convertToCSV } from "./helpers/excel";
import { checkIfRepoExists, userExists } from "./helpers/github";

if (process.argv[2] == "--help") {
  console.log(
    "Usage: 'npx tsx src/index.ts ubiquity/ubiquibot' for the entire repo\n\nUsage: 'npx tsx src/index.ts ubiquity/ubiquibot' 223\nThe above command outputs the total reward for the issue with the number 223\n"
  );
  console.log("Usage: 'npx tsx src/index.ts ubiquity' for the entire user");
  process.exit();
}

if (!process.argv[2]) {
  console.log("Please provide argumet in terms of owner/repo or just owner");
  process.exit();
}

const match = process.argv[2].split("/");

if (match.length > 2) {
  console.log("The argument you have provided you have provided does not match the syntax owner/repo or owner");
}

const owner = match[0];
const repo = match[1] ?? null;

if (!repo) {
  if (await userExists(owner)) {
    const rewardData = await calculateOrgReward(owner);
    await convertToCSV(rewardData);
  }
} else {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const exists = await checkIfRepoExists(owner, repo);
  if (!exists) {
    console.log("The repository you have provided does not exist");
    process.exit();
  }

  const issueNumber = Number(process.argv[3]) ?? null;
  const rewardData = issueNumber ? await calculateIssueReward(owner, repo, issueNumber) : await calculateRepoReward(owner, repo);
  await convertToCSV(rewardData);
}
