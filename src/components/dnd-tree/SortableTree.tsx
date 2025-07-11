"use client";
/**
 * https://zenn.dev/uraaaa24/articles/e36a7bfd52f0ca
 */

import React, { useEffect, useState } from "react";
import { useSortableTree } from "./useSortableTree";
import {
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

import { getChildrenIds } from "./utils";
import { SortableTreeItem } from "./SortableTreeItem";
import { TreeItem } from "@/types/habit/ui";

const INDENTION_WIDTH = 20;

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

/**
 * SortableTree コンポーネントが受け取るプロパティの型定義。
 * @property {TreeItem[]} defaultItems - ツリー構造の初期データ配列。
 */
type SortableTreeProps = {
  defaultItems: TreeItem[];
  // onItemsChange: (items: TreeItem[]) => void; // ★ コールバック関数を受け取る Props
  onItemsChange: (items: TreeItem[]) => void;
  onRemoveItem?: (id: number) => void;
  onEditItem?: (id: number) => void;
  onEditStyleItem?: (id: number) => void;
};

/**
 * ドラッグ＆ドロップで並び替え可能なツリーを表示するメインコンポーネント。
 * @param {SortableTreeProps} props - コンポーネントのプロパティ。
 * @param {TreeItem[]} props.defaultItems - 表示するツリーの初期データ。
 * https://zenn.dev/uraaaa24/articles/e36a7bfd52f0ca
 */
const SortableTree = (props: SortableTreeProps) => {
  const {
    defaultItems,
    onItemsChange,
    onRemoveItem,
    onEditItem,
    onEditStyleItem,
  } = props;
  // useSortableTree カスタムフックを呼び出し、ツリーの状態管理と操作に必要な値を取得する。
  // defaultItems を初期データとして渡す。
  const {
    flattenedItems, // フラット化されたツリーアイテムの配列 (表示用)
    activeId, // 現在ドラッグ中のアイテムのID
    activeItem, // 現在ドラッグ中のアイテムのデータ (FlattenedItem)
    sortedIds, // SortableContext に渡す、現在の順序でのアイテムID配列
    getDndContextProps, // DndContext に渡すプロパティを取得する関数
    getSortableTreeItemProps, // 各 SortableTreeItem に渡すプロパティを取得する関数
  } = useSortableTree({ defaultItems, onItemsChange });
  // console.log("SortableTree mounted", defaultItems);
  console.log("[SortableTree] defaultItems:", defaultItems);
  console.log(
    "[SortableTree] flattenedItems from useSortableTree:",
    flattenedItems
  );

  const sensors = useSensors(useSensor(PointerSensor));
  const [isMounted, setIsMounted] = useState(false); // マウント状態を管理するstate

  // コンポーネントがマウントされた後に isMounted を true に設定
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <DndContext {...getDndContextProps(sensors, measuring)}>
      <SortableContext items={sortedIds}>
        {flattenedItems.map((item) => (
          <SortableTreeItem
            key={item.id}
            onEditItem={onEditItem}
            onEditStyleItem={onEditStyleItem}
            onRemoveItem={onRemoveItem}
            {...getSortableTreeItemProps(item, INDENTION_WIDTH)}
          />
        ))}

        {isMounted &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeId && activeItem && (
                <SortableTreeItem
                  item={activeItem}
                  depth={activeItem.depth}
                  indentationWidth={INDENTION_WIDTH}
                  clone
                  childrenCount={
                    getChildrenIds(flattenedItems, activeId).length
                  }
                />
              )}
            </DragOverlay>,
            document.body // isMounted が true の時のみアクセスされる
          )}
      </SortableContext>
    </DndContext>
  );
};

export default SortableTree;
