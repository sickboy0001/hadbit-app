export interface HabitLogSummarySettings {
  logSummary: {
    [uuid: string]: LogSummaryItem; // UUIDをキーとするインデックスシグネチャ
  };
  globalLogSummaryDisplayOrder: string[];
}

interface LogSummaryItem {
  name: string;
  description: string; // タイポを修正: descritption -> description
  filtersHabitItemIds: number[];
  type: string; // 例: "1day", "7days", "21days" など、より具体的な型も検討可能
  isExpanded: boolean;
}
