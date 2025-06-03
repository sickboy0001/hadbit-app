import React, { useState } from "react";
import { TreeItem } from "@/types/habit/ui";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Separator のインポート元を変更

interface HabitSelectionTreeProps {
  treeItems: TreeItem[];
  onHabitSelect: (habitId: string, habitName: string) => void;
}

// 再帰的にツリーノードをレンダリングするヘルパーコンポーネント
const RenderTreeNode: React.FC<{
  item: TreeItem;
  onHabitSelect: (habitId: string, habitName: string) => void;
  level: number;
}> = ({ item, onHabitSelect, level }) => {
  // Collapsible の開閉状態を管理 (各ノードで独立)
  const [isOpen, setIsOpen] = useState(item.expanded ?? false); // treeItems の expanded 状態を初期値に利用
  // カテゴリノードの場合
  if (item.children && item.children.length > 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "flex items-center cursor-pointer select-none rounded-md hover:bg-accent/50 transition-colors",
              `pl-${level * 4 + 2}` // レベルに応じた左パディング
            )}
          >
            <ChevronRightIcon
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
            <span className="ml-1 font-semibold text-sm text-muted-foreground py-1">
              {item.name}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {item.children.map((child) => (
            <RenderTreeNode
              key={child.id}
              item={child}
              onHabitSelect={onHabitSelect}
              level={level + 1} // ネストレベルを増やす
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // 葉ノード (習慣アイテム) の場合
  return (
    <div className={cn("flex items-center", `pl-${level * 4 + 2}`)}>
      <Button
        variant="ghost" // ゴーストボタンで目立たなくする
        size="sm" // 小さめのサイズ
        onClick={() => onHabitSelect(String(item.id), item.name)}
        className="w-full justify-start text-left py-1 h-auto" // テキスト左寄せ、高さ自動調整
      >
        {item.name}
      </Button>
    </div>
  );
};

const TreeHabitSelection: React.FC<HabitSelectionTreeProps> = ({
  treeItems,
  onHabitSelect,
}) => {
  const treeItemAll: TreeItem = {
    id: 0, // IDはユニークである必要があるため、既存のIDと重複しないように注意
    name: "全て",
    children: [], // 「全て」は子を持たない想定
    expanded: false, // 初期状態は任意
    item_style: {},
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>習慣を選択</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <RenderTreeNode
          key={treeItemAll.id}
          item={treeItemAll}
          onHabitSelect={onHabitSelect}
          level={0} // トップレベルはレベル0
        />
        <Separator className="my-2" />{" "}
        {/* 区切り線を追加し、上下にマージンを設定 */}
        {treeItems.map((item) => (
          <RenderTreeNode
            key={item.id}
            item={item}
            onHabitSelect={onHabitSelect}
            level={0} // トップレベルはレベル0
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default TreeHabitSelection;
