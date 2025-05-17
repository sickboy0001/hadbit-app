import { TreeItem } from "@/types/habit/ui"; // TreeItem 型をインポート
import { PresetDisplayItem } from "@/components/Habit/Tracker/HabitTracker"; // PresetDisplayItem 型をインポート

// TreeItem[] を PresetDisplayItem[] に変換する関数
export const mapTreeItemsToPresetDisplayItems = (
  items: TreeItem[]
): PresetDisplayItem[] => {
  return items.map((item) => {
    const hasChildren = item.children && item.children.length > 0;
    if (hasChildren) {
      return {
        type: "category",
        id: String(item.id),
        name: item.name,
        children: mapTreeItemsToPresetDisplayItems(item.children!), // 再帰呼び出し
      };
    } else {
      return {
        type: "button",
        id: String(item.id),
        name: item.name,
        originalName: item.name,
      };
    }
  });
};
