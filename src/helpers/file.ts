import fs from "fs";

export function createDirectoryIfNotExists(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
    console.log(`Directory "${directoryPath}" created.`);
  } else {
    console.log(`Directory "${directoryPath}" already exists.`);
  }
}
