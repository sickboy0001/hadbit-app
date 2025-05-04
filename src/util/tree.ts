import { TreeItem } from "@/types/habit";

// ID を元に TreeItem を再帰的に検索する
export const findItemDeep = (
  items: TreeItem[],
  itemId: string
): TreeItem | null => {
  for (const item of items) {
    if (item.id === itemId) {
      return item;
    }
    if (item.children) {
      const found = findItemDeep(item.children, itemId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// ID を元に TreeItem を再帰的に検索し、指定されたプロパティで更新する
export const updateItemDeep = (
  items: TreeItem[],
  itemId: string,
  updates: Partial<TreeItem> // 更新するプロパティ (例: { name: '新しい名前' })
): TreeItem[] => {
  return items.map((item) => {
    if (item.id === itemId) {
      // IDが一致したら、updatesの内容でアイテムを更新
      return { ...item, ...updates };
    }
    if (item.children) {
      // 子要素も再帰的に更新
      const newChildren = updateItemDeep(item.children, itemId, updates);
      // 子要素が変更された場合のみ新しいオブジェクトを作成
      if (newChildren !== item.children) {
        return { ...item, children: newChildren };
      }
    }
    return item; // 変更がない場合はそのまま返す
  });
};

// デバッグ表示用にツリーデータを指定形式の文字列にフォーマットするヘルパー関数
export const formatTreeForDebug = (items: TreeItem[]): string => {
  let result = "";

  const formatRecursive = (
    items: TreeItem[],
    indent: string = "",
    parentId: string | null = "0"
  ) => {
    items.forEach((item, index) => {
      result += `${indent}${item.id}：${
        item.name
      } (index: ${index}, parentId: ${parentId ?? "null"})\n`;

      if (item.children && item.children.length > 0) {
        formatRecursive(item.children, indent + "　", item.id);
      }
    });
  };

  formatRecursive(items);
  return result;
};
export const removeItemDeep = (
  items: TreeItem[],
  idToRemove: string
): TreeItem[] => {
  return items.reduce((acc, item) => {
    if (item.id === idToRemove) {
      return acc; // このアイテムを除外
    }
    if (item.children && item.children.length > 0) {
      // 子要素に対しても再帰的に削除処理を実行
      const newChildren = removeItemDeep(item.children, idToRemove);
      // 子要素が変更された場合のみ新しいオブジェクトを作成
      if (newChildren !== item.children) {
        acc.push({ ...item, children: newChildren });
        return acc;
      }
    }
    acc.push(item); // このアイテムは保持
    return acc;
  }, [] as TreeItem[]); // 型アサーションを追加
};
