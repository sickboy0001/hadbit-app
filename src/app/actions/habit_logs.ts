"use server";

import { HabitLog } from "@/types/habit/ui";
import { createClient } from "@/util/supabase/server";
import { endOfDay, formatISO, parseISO, startOfDay } from "date-fns";

export interface DbHabitLog {
  id: number; // 主キー、自動インクリメント
  user_id: number;
  item_id: number;
  done_at: string; // ISO 8601 形式のタイムスタンプ文字列 (例: "2023-10-27T00:00:00.000Z")
  comment: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 指定されたユーザーIDと期間の習慣実行記録 (habit_logs) を取得します。
 * @param userId ユーザーID
 * @param doneAtStart 期間の開始日 (YYYY-MM-DD 形式の文字列)
 * @param doneAtEnd 期間の終了日 (YYYY-MM-DD 形式の文字列)
 * @returns 習慣実行記録の配列 (HabitLog[])
 */
export async function readHabitLogsByPeriod(
  userId: number,
  doneAtStart: string,
  doneAtEnd: string
): Promise<HabitLog[]> {
  const supabase = await createClient();

  // done_at_start の時刻を 00:00:00 に設定
  const startDate = new Date(doneAtStart);
  startDate.setUTCHours(0, 0, 0, 0); // UTCで設定

  // done_at_end の時刻を 23:59:59.999 に設定
  const endDate = new Date(doneAtEnd);
  endDate.setUTCHours(23, 59, 59, 999); // UTCで設定

  const { data, error } = await supabase
    .from("habit_logs")
    .select("*") // 必要に応じてカラムを指定: 'item_id, done_at, comment'
    .eq("user_id", userId)
    .gte("done_at", startDate.toISOString())
    .lte("done_at", endDate.toISOString())
    .order("done_at", { ascending: true }); // 例: 実行日時で昇順ソート

  if (error) {
    console.error("Error reading habit logs by period:", error);
    throw new Error("Failed to fetch habit logs by period.");
  }

  return data || [];
}

export async function readDbHabitLogsByPeriod(
  userId: number,
  doneAtStart: string,
  doneAtEnd: string
): Promise<DbHabitLog[]> {
  const supabase = await createClient();

  // done_at_start の時刻を 00:00:00 に設定
  const startDate = new Date(doneAtStart);
  startDate.setUTCHours(0, 0, 0, 0); // UTCで設定

  // done_at_end の時刻を 23:59:59.999 に設定
  const endDate = new Date(doneAtEnd);
  endDate.setUTCHours(23, 59, 59, 999); // UTCで設定

  const { data, error } = await supabase
    .from("habit_logs")
    .select("*") // 必要に応じてカラムを指定: 'item_id, done_at, comment'
    .eq("user_id", userId)
    .gte("done_at", startDate.toISOString())
    .lte("done_at", endDate.toISOString())
    .order("done_at", { ascending: true }); // 例: 実行日時で昇順ソート

  if (error) {
    console.error("Error reading habit logs by period:", error);
    throw new Error("Failed to fetch habit logs by period.");
  }

  return data || [];
}

export async function insertHabitLog(
  userId: number,
  itemId: number,
  logDate: string, // YYYY-MM-DD
  comment: string | null
): Promise<DbHabitLog> {
  const supabase = await createClient();

  const dateObj = parseISO(logDate);
  const startOfLogDay = startOfDay(dateObj);
  const doneAtIsoString = formatISO(startOfLogDay);

  const logEntryToInsert: Omit<DbHabitLog, "id" | "created_at" | "updated_at"> =
    {
      user_id: userId,
      item_id: itemId,
      done_at: doneAtIsoString,
      comment: comment,
    };

  const { data, error } = await supabase
    .from("habit_logs")
    .insert(logEntryToInsert)
    .select()
    .single(); // 1件のレコードを期待

  if (error) {
    console.error("Error inserting habit log:", error);
    // 一意性制約違反 (user_id, item_id, done_at の重複) の場合、より具体的なエラーを投げることも検討
    if (error.code === "23505") {
      // PostgreSQL unique_violation error code
      throw new Error("Insert operation did not return data.");
    }
    throw new Error(`Failed to insert habit log: ${error.message}`);
  }

  if (!data) {
    // このケースは通常発生しないはずだが、念のため
    throw new Error("Insert operation did not return data.");
  }

  return data as DbHabitLog;
}

/**
 * 既存の習慣実行記録 (habit_logs) をIDで指定して更新します。
 *
 * @param logId 更新する記録のID
 * @param newLogDate 新しい記録日 (YYYY-MM-DD 形式の文字列)
 * @param newComment 新しいコメント (オプショナル)
 * @returns 更新された習慣記録 (DbHabitLog)
 */
export async function updateHabitLog(
  logId: number,
  newLogDate: string, // YYYY-MM-DD
  newComment: string | null
): Promise<DbHabitLog> {
  const supabase = await createClient();
  const dateObj = parseISO(newLogDate);
  const startOfLogDay = startOfDay(dateObj);
  const newDoneAtIsoString = formatISO(startOfLogDay);

  const logEntryToUpdate = {
    done_at: newDoneAtIsoString,
    comment: newComment,
    updated_at: new Date().toISOString(), // 明示的に更新日時を設定
  };

  const { data, error } = await supabase
    .from("habit_logs")
    .update(logEntryToUpdate)
    .eq("id", logId)
    .select()
    .single();

  if (error) {
    console.error("Error updating habit log:", error);
    throw new Error(`Failed to update habit log: ${error.message}`);
  }
  if (!data) {
    throw new Error(
      `Update operation did not return data. Log with id ${logId} might not exist.`
    );
  }
  return data as DbHabitLog;
}

/**
 * 指定されたユーザーID、習慣項目ID、日付の習慣実行記録を削除します。
 *
 * @param userId ユーザーID
 * @param itemId 習慣項目のID
 * @param logDate 削除する記録の日付 (YYYY-MM-DD 形式の文字列)
 * @returns 削除に成功した場合は true、該当する記録がない場合は false
 */
export async function deleteDayHabitLog(
  userId: number,
  itemId: number,
  logDate: string // YYYY-MM-DD
): Promise<boolean> {
  const supabase = await createClient();

  // logDate (YYYY-MM-DD) をその日の開始時刻 (UTC) のISO文字列に変換
  const dateObj = parseISO(logDate);
  const startOfLogDay = startOfDay(dateObj);
  const doneAtIsoString = formatISO(startOfLogDay);

  const { error, count } = await supabase
    .from("habit_logs")
    .delete({ count: "exact" }) // countオプションで削除件数を取得
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .eq("done_at", doneAtIsoString); // 正規化されたdone_atで完全一致するものを削除

  if (error) {
    console.error("Error deleting habit log:", error);
    throw new Error(`Failed to delete habit log: ${error.message}`);
  }

  return count !== null && count > 0;
}

export async function deleteHabitLogById(
  userId: number,
  HabitLogId: number
): Promise<boolean> {
  const supabase = await createClient();

  // logDate (YYYY-MM-DD) をその日の開始時刻 (UTC) のISO文字列に変換

  const { error, count } = await supabase
    .from("habit_logs")
    .delete({ count: "exact" }) // countオプションで削除件数を取得
    .eq("user_id", userId)
    .eq("id", HabitLogId);

  if (error) {
    console.error("Error deleting habit log:", error);
    throw new Error(`Failed to delete habit log: ${error.message}`);
  }

  return count !== null && count > 0;
}

/**
 * 指定された期間の習慣ログを削除する内部関数
 * @param userId ユーザーID
 * @param habitId 習慣ID (数値型と仮定)
 * @param startDate 削除開始日 (Dateオブジェクト)
 * @param endDate 削除終了日 (Dateオブジェクト)
 * @returns 削除されたログの件数
 */
async function deleteLogsInDateRange(
  userId: string,
  habitId: number,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const supabase = await createClient();
  try {
    // done_at は通常タイムスタンプ型なので、日付の範囲で比較する
    // startOfDay と endOfDay を使って、その日の始まりから終わりまでを正確に指定
    const startRange = startOfDay(startDate);
    const endRange = endOfDay(endDate);

    const { error, count } = await await supabase
      .from("habit_logs")
      .delete({ count: "exact" })
      .eq("user_id", userId)
      .eq("item_id", habitId)
      .gte("done_at", startRange.toISOString()) // ISO文字列に変換
      .lte("done_at", endRange.toISOString()); // ISO文字列に変換

    // .returning({ id: HabitLogTable.id }); // 削除された行のIDを返す (件数確認のため)

    if (error) throw error; // エラーがあれば再スロー

    return count ?? 0; // 削除された件数を返す (countがnullの場合は0)
  } catch (error) {
    console.error("Error deleting logs in date range:", error);
    throw new Error("期間内のログ削除中にエラーが発生しました。");
  }
}

export type ImportMode = "import" | "deleteAndRegister";

export interface DbHabitLogInsert {
  item_id: string;
  done_at: Date;
  comment: string | null;
  user_id: number;
}

export async function importHabitLogsFromServer(
  habitIdStr: string,
  logsToInsert: DbHabitLogInsert[], //
  mode: ImportMode
): Promise<{
  success: boolean;
  message: string;
  importedCount?: number;
  deletedCount?: number;
}> {
  // logsToInsert が空の場合は処理を中断、または user_id を別途取得する必要がある
  if (logsToInsert.length === 0 && mode === "deleteAndRegister") {
    // 削除対象の日付範囲を特定できないため、何もしないかエラーを返す
    return {
      success: true,
      message: "インポートするログがありません。",
      importedCount: 0,
      deletedCount: 0,
    };
  }
  if (logsToInsert.length === 0) {
    return {
      success: true,
      message: "インポートするログがありません。",
      importedCount: 0,
    };
  }
  const userId = logsToInsert[0].user_id;

  const habitId = parseInt(habitIdStr, 10);
  if (isNaN(habitId)) {
    return { success: false, message: "無効な習慣IDです。" };
  }

  let deletedCount = 0;
  if (mode === "deleteAndRegister" && logsToInsert.length > 0) {
    // logsToInsert の日付から最小日と最大日を特定
    const dates = logsToInsert.map((log) => log.done_at);
    const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())));
    deletedCount = await deleteLogsInDateRange(
      String(userId),
      habitId,
      minDate,
      maxDate
    );
  }

  let importedCount = 0;
  if (logsToInsert.length > 0) {
    const supabase = await createClient();
    console.log("Insert habitlogs:", logsToInsert);
    // DbHabitLogInsert の item_id は string なので、数値の habitId に合わせるか、
    // insert するデータの item_id を string にする必要があります。
    // ここでは、DbHabitLogInsert の item_id が string のままであると仮定し、
    // habitId (数値) を文字列に変換して比較・挿入します。
    // もし DbHabitLogInsert の item_id を数値にできるなら、そちらの方が望ましいです。
    const logsForDb = logsToInsert.map((log) => ({
      user_id: log.user_id,
      item_id: parseInt(String(log.item_id), 10), // item_id を数値に変換 (habitId と型を合わせる)
      done_at: formatISO(startOfDay(log.done_at)), // 日付をISO文字列 (YYYY-MM-DDTHH:mm:ss.sssZ) に正規化
      comment: log.comment,
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from("habit_logs")
      .insert(logsForDb)
      .select("id"); // 挿入されたレコードのIDを取得 (件数確認のため)

    if (insertError) {
      console.error("Error inserting habit logs:", insertError);
      return {
        success: false,
        message: `ログの挿入中にエラーが発生しました: ${insertError.message}`,
      };
    }
    importedCount = insertedData?.length ?? 0;
  }
  return {
    success: true,
    message: "インポート処理が完了しました。",
    importedCount,
    deletedCount,
  };
}
