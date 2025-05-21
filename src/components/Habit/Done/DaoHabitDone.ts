"use client";
import {
  readHabitItems,
  readHabitItemTreeWithUserId,
} from "@/app/actions/habit_items";
import {
  DbHabitLog,
  deleteHabitLog,
  insertHabitLog,
  readDbHabitLogsByPeriod,
  updateHabitLog,
} from "@/app/actions/habit_logs";
import { HabitItem, HabitItemTree } from "@/types/habit/habit_item";

export async function fetchHabitDataForUI(userId: number): Promise<{
  habitItems: HabitItem[];
  habitItemTreeRaw: HabitItemTree[];
}> {
  const [habitItems, habitItemTreeRaw] = await Promise.all([
    readHabitItems(userId),
    readHabitItemTreeWithUserId(userId),
  ]);
  return { habitItems, habitItemTreeRaw };
}

export async function fetchSortedHabitLogs(
  userId: number,
  startDate: string, // Expecting "yyyy-MM-dd"
  endDate: string // Expecting "yyyy-MM-dd"
): Promise<DbHabitLog[]> {
  const dbLogs = await readDbHabitLogsByPeriod(userId, startDate, endDate);

  // dbLogs を done_at (降順) と updated_at (降順) でソート
  const sortedDbLogs = dbLogs.sort((a, b) => {
    // まず done_at で比較 (新しいものが先)
    const dateComparison =
      new Date(b.done_at).getTime() - new Date(a.done_at).getTime();
    if (dateComparison !== 0) {
      return dateComparison;
    }
    // done_at が同じ場合は updated_at で比較 (新しいものが先)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return sortedDbLogs;
}

export async function addHabitLogEntry(
  userId: number,
  itemId: number,
  doneDate: string, // Expecting "yyyy-MM-dd"
  comment: string | null
): Promise<DbHabitLog | null> {
  // The actual database insertion is handled by the server action
  const newLog = await insertHabitLog(userId, itemId, doneDate, comment);
  return newLog;
}
export async function updateHabitLogEntry(
  logId: number,
  doneAt: string, // Expecting ISO string or "yyyy-MM-dd"
  comment: string
): Promise<DbHabitLog | null> {
  // The actual database update is handled by the server action
  const updatedLog = await updateHabitLog(logId, doneAt, comment);
  return updatedLog;
}

export async function deleteHabitLogEntry(
  userId: number,
  itemId: number,
  doneDate: string // Expecting "yyyy-MM-dd"
): Promise<boolean> {
  // The actual database deletion is handled by the server action
  const success = await deleteHabitLog(userId, itemId, doneDate);
  return success;
}
