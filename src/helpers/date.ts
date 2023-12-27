export function getLastYearDateRange(): [string, string] {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  return [startDate.toISOString().split("T")[0], endDate];
}
