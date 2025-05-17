"use server";

import { HabitLog } from "@/types/habit/ui";
import { createClient } from "@/util/supabase/server";
import { formatISO, parseISO, startOfDay } from "date-fns";

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
export async function deleteHabitLog(
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
