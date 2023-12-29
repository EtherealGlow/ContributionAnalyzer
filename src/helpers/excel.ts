import { createWriteStream } from "fs";

function getMaxPermits(data: Record<string, { reward: number; permit: string[] }>): number {
  let maxPermits = 0;

  for (const assignee in data) {
    if (Object.prototype.hasOwnProperty.call(data, assignee)) {
      const permits = data[assignee].permit;
      maxPermits = Math.max(maxPermits, permits.length);
    }
  }

  return maxPermits;
}

export async function convertToCSV(data: Record<string, { reward: number; permit: string[] }>, outputPath: string = "output/output.csv"): Promise<void> {
  const csvData: string[] = [];

  // Push the header row
  csvData.push(["assignee", "reward", ...Array.from({ length: getMaxPermits(data) }, (a, i) => `permit${i + 1}`)].join(","));

  // Iterate through data
  for (const assignee in data) {
    if (Object.prototype.hasOwnProperty.call(data, assignee)) {
      const reward = data[assignee].reward;
      const permits = data[assignee].permit;

      // Push data for each assignee
      csvData.push([assignee, reward, ...permits].join(","));
    }
  }

  // Join the array into a CSV string
  const csvString = csvData.join("\n");

  // Write CSV string to file
  const stream = createWriteStream(outputPath);
  stream.write(csvString);
  stream.end();
}
