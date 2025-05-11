import { format, toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns"; // parseISO は date-fns 本体から

export const formatUtcToJstString = (
  utcDateString: string | null | undefined,
  outputFormat: string = "yyyy/MM/dd HH:mm" // デフォルトの書式
): string => {
  const jstDate = convertUtcStringToJstDate(utcDateString); // まず JST の Date オブジェクトを取得
  return jstDate
    ? format(jstDate, outputFormat, { timeZone: "Asia/Tokyo" })
    : ""; // Date があればフォーマット、なければ空文字
};

// // UTCの日付文字列を日本時間の Date オブジェクトに変換するヘルパー関数 (ベース)
const convertUtcStringToJstDate = (
  utcDateString: string | null | undefined
): Date | null => {
  if (!utcDateString) {
    return null; // null や undefined の場合は null を返す
  }
  // タイムゾーン情報がない場合、UTC ('Z') を補完
  const isoStringWithZ = utcDateString.endsWith("Z")
    ? utcDateString
    : utcDateString + "Z";
  const utcDate = parseISO(isoStringWithZ); // UTCとしてパース
  // utcToZonedTime を使って JST の Date オブジェクトに変換
  return toZonedTime(utcDate, "Asia/Tokyo");
};
