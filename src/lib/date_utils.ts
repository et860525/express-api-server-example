import { format } from "date-fns";

/**
 * 時間儲存格式化
 * @param date - 時間(預設為當下時間)
 * @example 2025-01-01 15:42:01
 * @returns Date - 格式化後的 UTC+8 時間
 */
export function getNowDate(date: Date = new Date()): Date {
  const targetDate = new Date(date);
  targetDate.setHours(targetDate.getHours() + 8);
  const tzDate = format(targetDate, "yyyy-MM-dd HH:mm:ss");

  return new Date(tzDate);
}

/**
 * 時間顯示格式化
 * @param date - 時間
 * @example 2025-01-01 15:42:01
 * @returns string
 */
export function formatToDisplay(dateString: string): string {
  if (!dateString.includes("T")) return dateString;

  const [datePart, timePart] = dateString.split("T");

  if (!datePart || !timePart) return dateString;

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  return `${year}/${month}/${day} ${hour}:${minute}`;
}
