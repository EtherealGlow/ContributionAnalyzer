import { getCompletedIssues } from "./helpers/issue";
import { Label } from "./types/github";

const completedIssues = await getCompletedIssues("EtherealGlow", "ubiquibot");

for (let i = 0; i < completedIssues.length; i++) {
  const assignee = completedIssues[i].assignee;
  let labels = completedIssues[i].labels.filter((label) => !Array.isArray(label)) as Label[];
  labels = labels.filter((label) => label.name?.includes("Price"));

  if (assignee == null) continue;
  if (!labels[0]?.name) continue;

  console.log(`Assignee: ${assignee?.login}, reward: ${labels[0]?.name}`);
}
