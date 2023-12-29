import { WorkSheet, utils, WorkBook, writeFile } from "xlsx";

export async function convertToExcel(data: object): Promise<void> {
  const dataEntries = Object.entries(data);
  const ws: WorkSheet = utils.aoa_to_sheet(dataEntries);
  const wb: WorkBook = utils.book_new();
  utils.book_append_sheet(wb, ws, "Sheet1");
  writeFile(wb, "output/output.xlsx");
}
