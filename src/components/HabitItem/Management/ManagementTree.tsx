"use client";
import React, { useCallback, useState } from "react";

import { initialItems } from "@/components/dnd-tree/dummy";
import SortableTree from "@/components/dnd-tree/SortableTree";
import { TreeItem } from "@/components/dnd-tree/types";

const ManagementTree: React.FC = () => {
  const [treeItems, setTreeItems] = useState<TreeItem[]>(initialItems);

  // SortableTree から変更通知を受け取るコールバック関数
  // useCallback でラップして、SortableTree の不要な再レンダリングを防ぐ
  const handleItemsChange = useCallback((newItems: TreeItem[]) => {
    console.log("Tree items updated in ManagementTree:", newItems); // デバッグ用
    setTreeItems(newItems); // 受け取った新しいデータで状態を更新
  }, []); // 依存配列は空

  return (
    <div>
      {/* SortableTree に現在の状態とコールバック関数を渡す */}
      <SortableTree
        defaultItems={treeItems} // 初期表示用に現在の状態を渡す
        onItemsChange={handleItemsChange} // 変更通知を受け取る関数を渡す
      />
      {/* デバッグ用に現在の状態を表示 */}
      <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
        {JSON.stringify(treeItems, null, 2)}
      </pre>
    </div>
  );
};

export default ManagementTree;
