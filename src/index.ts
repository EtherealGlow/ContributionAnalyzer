import { calculateIssueReward, calculateRepoReward } from "./helpers/calculateReward";
import { convertToExcel } from "./helpers/excel";
import { checkIfRepoExists } from "./helpers/github";

if (process.argv[2] == "--help") {
  console.log(
    "Usage: 'npx tsx src/index.ts ubiquity/ubiquibot' for the entire repo\n\nUsage: 'npx tsx src/index.ts ubiquity/ubiquibot' 223\nThe above command outputs the total reward for the issue with the number 223"
  );
  process.exit();
}

const regexPattern = /^([\w-]+)\/([\w-]+)$/;
const match = process.argv[2].match(regexPattern);
const owner = match ? match[1] : null;
const repo = match ? match[2] : null;

if (!repo || !owner) {
  console.log("The repository you have provided does not match the pattern owner/repo");
  process.exit();
}
// eslint-disable-next-line @typescript-eslint/naming-convention
const exists = await checkIfRepoExists(owner, repo);
if (!exists) {
  console.log("The repository you have provided does not exist");
  process.exit();
}

const issueNumber = Number(process.argv[3]) ?? null;
const rewardData = issueNumber ? await calculateIssueReward(owner, repo, issueNumber) : await calculateRepoReward(owner, repo);
await convertToExcel(rewardData);
