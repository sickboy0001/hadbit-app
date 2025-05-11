"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
  closestCenter,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import { buildTree, flattenTree, getChildrenIds, getProjection } from "./utils";
import {
  FlattenedItem,
  FlattenedItems,
  SensorContext,
  TreeItem,
} from "@/types/habit/ui";

const DEFAULT_INDENTATION_WIDTH = 50;

type UseSortableTreeOptions = {
  defaultItems: TreeItem[];
  indentationWidth?: number;
  indicator?: boolean;
  onItemsChange?: (items: TreeItem[]) => void;
  // onRemoveItem?: (id: string) => void; // onRemoveItem も受け取るようにする (SortableTree.tsx の呼び出しに合わせる)
};

export const useSortableTree = ({
  defaultItems,
  indentationWidth = DEFAULT_INDENTATION_WIDTH,
  indicator = false,
  onItemsChange,
}: // onRemoveItem,
UseSortableTreeOptions) => {
  // console.log("[useSortableTree] defaultItems prop changed:", defaultItems);

  useEffect(() => {
    setItems(defaultItems);
  }, [defaultItems]);

  const [items, setItems] = useState(defaultItems);
  const [activeId, setActiveId] = useState<number | null>(null); // UniqueIdentifier から number に変更
  const [overId, setOverId] = useState<number | null>(null); // UniqueIdentifier から number に変更

  const [offsetLeft, setOffsetLeft] = useState(0);

  const [expandedIds, setExpandedIds] = useState<number[]>([]); // UniqueIdentifier[] から number[] に変更

  const flattenedItems = useMemo(() => {
    // console.log("[useSortableTree] Input to flattening function:", items);
    const flattenedTree = flattenTree(items);
    // console.log(
    //   "[useSortableTree] Output from flattening function:",
    //   flattenedTree
    // );
    const expandedItems = flattenedTree.filter(
      // ルートの parentId は 0 とし、それ以外は expandedIds に含まれるものを表示
      ({ parentId }) =>
        parentId === 0 || (parentId !== null && expandedIds.includes(parentId))
    );

    return expandedItems;
  }, [items, expandedIds]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const sortedIds = useMemo(() => {
    return flattenedItems.map(({ id }) => id);
  }, [flattenedItems]);

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const resetState = () => {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.style.setProperty("cursor", "");
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const id = Number(active.id);
    setActiveId(id);
    setOverId(id);
    document.body.style.setProperty("cursor", "grabbing");
  };

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id ? Number(over.id) : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    resetState();
    console.log("handleDragEnd called");
    if (projected && over) {
      const { depth, parentId } = projected;
      const activeIdNum = Number(active.id);
      const overIdNum = Number(over.id);

      const clonedItems: FlattenedItems = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      // id は number になっているので、比較も number で行う
      const overIndex = clonedItems.findIndex(({ id }) => id === overIdNum);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeIdNum);

      if (activeIndex === -1 || overIndex === -1) return;

      const activeItem = clonedItems[activeIndex]; // activeItem.id は number
      const childrenIds = getChildrenIds(clonedItems, activeItem.id);

      clonedItems[activeIndex] = { ...activeItem, depth, parentId };

      clonedItems.forEach((item) => {
        if (childrenIds.includes(item.id)) {
          item.depth = depth + 1;
        }
      });

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setExpandedIds((expandedIds) => {
        const newExpandedIds = expandedIds.filter(
          (id) => !childrenIds.includes(id)
        );
        if (parentId !== null) {
          // parentId は number | null
          newExpandedIds.push(parentId);
        }

        return Array.from(new Set(newExpandedIds));
      });

      setItems(newItems);

      // ★ アイテムの順序が変更された後、onItemsChange コールバックを呼び出す
      if (onItemsChange) {
        onItemsChange(newItems);
      }
    }
  };

  const handleDragCancel = () => {
    resetState();
  };

  const handleToggleExpand = useCallback(
    (itemId: number) => {
      // id の型を number に変更
      setExpandedIds((currentExpandedIds) => {
        if (currentExpandedIds.includes(itemId)) {
          const childrenIds = getChildrenIds(items, itemId); // getChildrenIds は number を受け取る
          return currentExpandedIds.filter(
            (
              expandedId // expandedId も number
            ) => expandedId !== itemId && !childrenIds.includes(expandedId)
          );
        } else {
          return [...new Set([...currentExpandedIds, itemId])];
        }
      });
    },
    [items]
  );

  const getDndContextProps = (
    sensors: SensorDescriptor<SensorOptions>[],
    measuring: {
      droppable: {
        strategy: MeasuringStrategy;
      };
    }
  ) => {
    return {
      sensors,
      measuring,
      collisionDetection: closestCenter,
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel,
    };
  };

  const getSortableTreeItemProps = (
    item: FlattenedItem,
    indentationWidth = DEFAULT_INDENTATION_WIDTH
  ) => {
    return {
      item,
      depth: item.id === activeId && projected ? projected.depth : item.depth,
      onExpand:
        item.children.length > 0
          ? () => handleToggleExpand(item.id)
          : undefined,
      expanded: item.children.length > 0 && expandedIds.includes(item.id),
      indentationWidth,
    };
  };

  return {
    items,
    flattenedItems,
    activeId,
    overId,
    sortedIds,
    indicator,
    activeItem,
    projected,
    expandedIds,
    getDndContextProps,
    getSortableTreeItemProps,
    handleToggleExpand,
  };
};
