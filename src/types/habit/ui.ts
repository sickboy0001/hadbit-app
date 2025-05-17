import type { MutableRefObject } from "react";

export type TreeItem = {
  id: number;
  name: string;
  children: TreeItem[];
  expanded: boolean;
};

export type TreeItems = TreeItem[];

export type FlattenedItem = TreeItem & {
  depth: number;
  parentId: number | null;
  index: number;
};

export type FlattenedItems = FlattenedItem[];

export type SensorContext = MutableRefObject<{
  items: FlattenedItems;
  offset: number;
}>;

// Habit 型定義 (HabitDisplayTable.tsx や他の場所でも使われる想定)
export type Habit = {
  id: string;
  name: string;
  parentId?: string;
  children?: Habit[];
  // completedDates?: Date[]; // 完了日を記録する配列 -> logs に変更
  logs: HabitLog[]; // 完了日とコメントを記録する配列
  level: number; // 階層の深さ
};

// HabitLog 型定義 (実績の日付とコメント)
export type HabitLog = {
  date: Date;
  comment?: string;
};

// PresetButton 型定義 (PresetButtonsSection.tsx で使われる想定)
export type PresetButton = {
  id: string;
  name: string;
  parentId: string; // どの親習慣に紐づくか
};
