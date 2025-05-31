"use client";

import { HabitItem } from "@/types/habit/habit_item";
import { HabitLogSummarySettings } from "@/types/habit/logSummaryItemSetting";
import { TreeItem } from "@/types/habit/ui";

/**
 * 新しいログサマリー設定のデフォルトオブジェクトを生成します。
 * @param allHabitItemIds - (オプション) フィルターに初期設定する全ての習慣アイテムIDの配列。
 * @returns 新しいログサマリー設定項目。
 */
export const createNewLogSummarySettingItem = (
  allHabitItemIds: number[] = []
): HabitLogSummarySettings["logSummary"][string] => {
  return {
    name: "新しいサマリ",
    description: "新しいサマリの説明です。",
    filtersHabitItemIds: allHabitItemIds, // 初期状態ではフィルターなし
    type: "1day", // デフォルトタイプ
    isExpanded: true, // 最初は展開しておく
  };
};

// 将来的に他のクライアントサイドの習慣設定関連サービス関数をここに追加できます。
// 例えば、設定のバリデーション関数など。

/**
 * 既存のログサマリー設定に新しい項目を追加、または新しい設定を初期化します。
 * @param currentSettings - 現在の HabitLogSummarySettings オブジェクト、または null。
 * @param newOrderId - 新しいサマリー項目のユニークID。
 * @param newSummaryItem - createNewLogSummarySettingItem で生成された新しいサマリー項目。
 * @returns 更新された HabitLogSummarySettings オブジェクト。
 */
export const addLogSummarySetting = (
  currentSettings: HabitLogSummarySettings | null,
  newOrderId: string,
  newSummaryItem: HabitLogSummarySettings["logSummary"][string]
): HabitLogSummarySettings => {
  if (!currentSettings) {
    return {
      logSummary: { [newOrderId]: newSummaryItem },
      globalLogSummaryDisplayOrder: [newOrderId],
    };
  } else {
    return {
      ...currentSettings,
      logSummary: {
        ...currentSettings.logSummary,
        [newOrderId]: newSummaryItem,
      },
      globalLogSummaryDisplayOrder: [
        ...currentSettings.globalLogSummaryDisplayOrder,
        newOrderId,
      ],
    };
  }
};

export const addNewSummaryToSettings = (
  currentSettings: HabitLogSummarySettings | null,
  newOrderId: string,
  allHabitItemIds: number[] = []
): HabitLogSummarySettings => {
  const newSummaryItem = createNewLogSummarySettingItem(allHabitItemIds);
  return addLogSummarySetting(currentSettings, newOrderId, newSummaryItem);
};

const getLeafNodeIdsFromTreeRecursive = (
  nodes: TreeItem[],
  leafIds: number[]
): void => {
  if (!Array.isArray(nodes)) {
    // console.warn("getLeafNodeIdsFromTreeRecursive received non-array nodes:", nodes);
    return;
  }
  for (const item of nodes) {
    if (!item.children || item.children.length === 0) {
      // TreeItem.id が string の場合も考慮して number に変換
      const numericId =
        typeof item.id === "string" ? parseInt(item.id, 10) : item.id;
      if (!isNaN(numericId)) {
        leafIds.push(numericId);
      }
    } else {
      getLeafNodeIdsFromTreeRecursive(item.children, leafIds);
    }
  }
};

export const getLeafHabitItems = (
  treeItems: TreeItem[],
  allHabitItems: HabitItem[]
): HabitItem[] => {
  console.log("getLeafHabitItems called treeItem", treeItems);
  const leafIds: number[] = [];
  getLeafNodeIdsFromTreeRecursive(treeItems, leafIds);
  return allHabitItems.filter((habit) => leafIds.includes(habit.id));
};
