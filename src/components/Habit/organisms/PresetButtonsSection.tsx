"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NestedGroupedButtons,
  PresetDisplayItem,
  TreeItem,
} from "@/types/habit/ui";
import { mapTreeItemsToPresetDisplayItems } from "@/util/habitTreeConverters";

interface PresetButtonsSectionProps {
  treeItems: TreeItem[]; // groupedButtons の代わりに treeItems を受け取る
  onToggleHabit: (habitId: string, habitName: string) => void;
  getParentName: (parentId: string) => string;
}

// 再帰的にアイテムをレンダリングするコンポーネント
const RenderPresetItem: React.FC<{
  item: PresetDisplayItem;
  onToggleHabit: (habitId: string, habitName: string) => void;
  level: number; // ネストレベル
}> = ({ item, onToggleHabit, level }) => {
  const indentStyle = { paddingLeft: `${level * 20}px` }; // 1レベルあたり20pxインデント

  if (item.type === "button") {
    return (
      <div style={indentStyle} className="my-1">
        <Button
          key={item.id}
          variant="outline"
          size="sm"
          onClick={() => onToggleHabit(item.id, item.originalName)}
          className="w-full justify-start text-left hover:bg-accent focus:bg-accent" // ボタンを左寄せ、テキストも左寄せ
        >
          {item.name}
        </Button>
      </div>
    );
  }

  if (item.type === "category") {
    // 子要素をボタンとカテゴリに分類
    const childButtons = item.children.filter(
      (child): child is Extract<PresetDisplayItem, { type: "button" }> =>
        child.type === "button"
    );
    const childCategories = item.children.filter(
      (child): child is Extract<PresetDisplayItem, { type: "category" }> =>
        child.type === "category"
    );

    return (
      <div className="my-1">
        {/* カテゴリ全体のラッパー */}
        <div
          style={indentStyle}
          className="font-semibold text-sm py-1 text-muted-foreground"
        >
          {item.name} {/* カテゴリ名表示 */}
        </div>
        {/* ボタン群を横並びで表示 */}
        {childButtons.length > 0 && (
          <div
            style={{ paddingLeft: `${(level + 1) * 20}px` }} // ボタン群もインデント
            className="flex flex-wrap gap-2 mt-1"
          >
            {childButtons.map((buttonItem) => (
              <Button
                key={buttonItem.id}
                variant="outline"
                size="sm"
                onClick={() =>
                  onToggleHabit(buttonItem.id, buttonItem.originalName)
                }
              >
                {buttonItem.name}
              </Button>
            ))}
          </div>
        )}
        {/* サブカテゴリ群を縦のツリー表示で表示 */}
        {childCategories.length > 0 &&
          childCategories.map((categoryItem) => (
            <RenderPresetItem
              key={categoryItem.id}
              item={categoryItem}
              onToggleHabit={onToggleHabit}
              level={level + 1} // ネストレベルを増やす
            />
          ))}
      </div>
    );
  }
  return null;
};

const PresetButtonsSection: React.FC<PresetButtonsSectionProps> = ({
  treeItems,
  onToggleHabit,
  getParentName,
}) => {
  // treeItems から groupedButtons を生成
  const groupedButtons = treeItems.reduce<NestedGroupedButtons>(
    (acc, topLevelItem) => {
      acc[String(topLevelItem.id)] = mapTreeItemsToPresetDisplayItems(
        topLevelItem.children || []
      );
      return acc;
    },
    {}
  );

  if (Object.keys(groupedButtons).length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">■習慣の記録</h2>
        <p className="text-sm text-muted-foreground">
          記録対象の習慣がありません。管理画面から習慣を登録してください。
        </p>
      </div>
    );
  }
  return (
    <>
      <h2 className="text-xl font-semibold">■習慣の記録</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(groupedButtons).map(([parentId, items]) => {
          // トップレベルのアイテムをボタンとカテゴリに分類
          const topLevelButtons = items.filter(
            (item): item is Extract<PresetDisplayItem, { type: "button" }> =>
              item.type === "button"
          );
          const topLevelCategories = items.filter(
            (item): item is Extract<PresetDisplayItem, { type: "category" }> =>
              item.type === "category"
          );

          return (
            <Card key={parentId}>
              <CardHeader className="py-0 pt-1">
                {/* 上部パディングを少し増やし、下部パディングは0 */}
                <CardTitle className="text-lg font-medium mb-0">
                  {/* 文字サイズを大きくし、下マージンを0に */}
                  {getParentName(parentId)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-0 px-2">
                {/* トップレベルのボタン群を横並びで表示 */}
                {topLevelButtons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-0">
                    {topLevelButtons.map((buttonItem) => (
                      <Button
                        key={buttonItem.id}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onToggleHabit(buttonItem.id, buttonItem.originalName)
                        }
                      >
                        {buttonItem.name}
                      </Button>
                    ))}
                  </div>
                )}
                {/* トップレベルのカテゴリ群を縦のツリー表示で表示 */}
                {topLevelCategories.map((categoryItem) => (
                  <RenderPresetItem
                    key={categoryItem.id}
                    item={categoryItem}
                    onToggleHabit={onToggleHabit}
                    level={0} // RenderPresetItem内でのインデントはlevelに基づいて行われる
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default PresetButtonsSection;
