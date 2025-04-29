import type { UniqueIdentifier } from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import { FlattenedItem, FlattenedItems, TreeItem, TreeItems } from "./types";

/**
 * ドラッグ中のアイテムの深さを取得する
 *
 * @param offSet
 * @param indentationWidth
 * @returns
 */
const getDragDepth = (offSet: number, indentationWidth: number) => {
  return Math.round(offSet / indentationWidth);
};

const getDepth = (
  depth: number,
  previousItem: FlattenedItem,
  nextItem: FlattenedItem
) => {
  const maxDepth = previousItem ? previousItem.depth + 1 : 0;
  const minDepth = nextItem ? nextItem.depth : 0;

  if (depth >= maxDepth) {
    return maxDepth;
  } else if (depth < minDepth) {
    return minDepth;
  }
  return depth;
};

const getParentId = (
  depth: number,
  overItemIndex: number,
  previousItem: FlattenedItem,
  newItems: FlattenedItem[]
) => {
  if (depth === 0 || !previousItem) {
    return null;
  }

  if (depth === previousItem.depth) {
    return previousItem.parentId ?? null;
  }

  if (depth > previousItem.depth) {
    return previousItem.id;
  }

  const newParent = newItems
    .slice(0, overItemIndex)
    .reverse()
    .find((item) => item.depth === depth)?.parentId;

  return newParent ?? null;
};

/**
 * ドラッグ中のアイテムの投影を取得する
 *
 * @param items
 * @param activeId
 * @param overId
 * @param dragOffset
 * @param indentationWidth
 * @returns
 */
export const getProjection = (
  items: FlattenedItems,
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number
) => {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];

  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];

  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  const depth = getDepth(projectedDepth, previousItem, nextItem);
  const parentId = getParentId(depth, overItemIndex, previousItem, newItems);

  return { depth, parentId };
};

const findFromTreeItem = (
  items: TreeItem[],
  id: UniqueIdentifier
): FlattenedItem | undefined => {
  const flattenedItems = flatten(items);
  return flattenedItems.find((item) => item.id === id);
};

export const getChildrenIds = (
  items: TreeItems,
  id: UniqueIdentifier,
  includeSelf = false
): UniqueIdentifier[] => {
  const item = findFromTreeItem(items, id);
  if (!item) {
    return [];
  }

  const childrenIds = item.children.flatMap((child) =>
    getChildrenIds(items, child.id, true)
  );

  return includeSelf ? [id, ...childrenIds] : childrenIds;
};

/**
 * ツリー構造をフラット化し、階層情報と親子関係を含む配列を返す
 *
 * @param items
 * @param parentId
 * @param depth
 * @returns
 */
const flatten = (
  items: TreeItems,
  parentId: UniqueIdentifier | null = null,
  depth = 0
): FlattenedItems => {
  const result: FlattenedItems = [];

  items.forEach((item, index) => {
    const currentItem: FlattenedItem = {
      ...item,
      depth,
      parentId,
      index,
    };
    result.push(currentItem);

    const children = flatten(item.children, item.id, depth + 1);
    result.push(...children);
  });

  return result;
};

/**
 * ツリー構造をフラット化し、階層情報と親子関係を含む配列を返す
 *
 * flatten メソッドをラップしたエントリーポイントとして利用可能。
 *
 * @param items - ツリー構造のルートアイテム。
 * @returns フラット化されたアイテムの配列。
 */

export const flattenTree = (items: TreeItems): FlattenedItems => {
  return flatten(items);
};

/**
 * 指定されたIDを持つアイテムを検索する
 *
 * @param items
 * @param itemId
 * @returns
 */
export const findItem = (items: TreeItems, itemId: UniqueIdentifier) => {
  return items.find(({ id }) => id === itemId);
};

/**
 * フラット化されたアイテム配列からツリー構造を構築する
 *
 * @param flattenItems
 * @returns
 */
export const buildTree = (flattenItems: FlattenedItems): TreeItems => {
  const root: TreeItem = {
    id: "root",
    name: "root",
    expanded: false,
    children: [],
  };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { ...item, children };
    parent.children.push(item);
  }

  return root.children;
};

/**
 * ツリー構造の中から指定したIDのアイテムを再帰的に検索する
 *
 * @param items
 * @param itemId
 * @returns
 */
export const findItemDeep = (
  items: TreeItems,
  itemId: UniqueIdentifier
): TreeItem | undefined => {
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
};

/**
 *  指定したIDのアイテムを削除する
 *
 * @param items
 * @param itemId
 * @returns
 */
export const removeItem = (
  items: TreeItems,
  itemId: UniqueIdentifier
): TreeItems => {
  const newItems = [];

  for (const item of items) {
    if (item.id === itemId) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, itemId);
    }

    newItems.push(item);
  }

  return newItems;
};

/**
 * ツリー構造内の特定のアイテムのプロパティを更新する
 *
 * @param items
 * @param itemId
 * @param property
 * @param setter
 * @returns
 */
export const setProperty = <T extends keyof TreeItem>(
  items: TreeItems,
  itemId: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T]
) => {
  for (const item of items) {
    if (item.id == itemId) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, itemId, property, setter);
    }
  }

  return [...items];
};

/**
 * 子孫のアイテム数を取得する
 *
 * @param items
 * @param count
 * @returns
 */
const countChildren = (items: TreeItems, count = 0): number => {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
};

/**
 * 指定したIDのアイテムの子孫の数を取得する
 *
 * @param items
 * @param id
 * @returns
 */
export const getChildCount = (
  items: TreeItems,
  id: UniqueIdentifier
): number => {
  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
};

/**
 * 指定されたIDを持つアイテムの子孫を削除する
 *
 * @param items
 * @param parentIdsToExclude
 * @returns
 */
export const removeChildrenOf = (
  items: FlattenedItems,
  parentIdsToExclude: UniqueIdentifier[]
) => {
  const excludeParentIds = new Set(parentIdsToExclude);

  return items.filter((item) => {
    const { parentId, id, children } = item;

    if (parentId && excludeParentIds.has(parentId)) {
      if (children.length) {
        excludeParentIds.add(id);
      }

      return false;
    }

    return true;
  });
};
