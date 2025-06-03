import React from "react";
import { TreeItem } from "@/types/habit/ui";
import SortableTree from "@/components/dnd-tree/SortableTree";

interface TreeDisplayProps {
  treeItems: TreeItem[];
  onItemsChange: (newItems: TreeItem[]) => void;
  onRemoveItem: (id: number) => void;
  onEditItem: (id: number) => void;
  onEditStyleItem?: (id: number) => void;
}

const TreeDisplay: React.FC<TreeDisplayProps> = ({
  treeItems,
  onItemsChange,
  onRemoveItem,
  onEditItem,
  onEditStyleItem,
}) => {
  return (
    <>
      <SortableTree
        defaultItems={treeItems}
        onItemsChange={onItemsChange}
        onRemoveItem={onRemoveItem}
        onEditItem={onEditItem}
        onEditStyleItem={onEditStyleItem}
      />
      {/* デバッグ用にフォーマットされた状態を表示 */}
      {/* <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto whitespace-pre-wrap">
        {formatTreeForDebug(treeItems)}
      </pre> */}
      {/* <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
        {JSON.stringify(treeItems, null, 2)}
      </pre> */}
    </>
  );
};

export default TreeDisplay;
