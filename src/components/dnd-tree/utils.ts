import { arrayMove } from "@dnd-kit/sortable";
import {
  FlattenedItem,
  FlattenedItems,
  TreeItem,
  TreeItems,
} from "@/types/habit/ui";

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
  activeId: number,
  overId: number,
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
  id: number // UniqueIdentifier から number に変更
): FlattenedItem | undefined => {
  const flattenedItems = flatten(items);
  return flattenedItems.find((item) => item.id === id);
};

export const getChildrenIds = (
  items: TreeItems,
  id: number,
  includeSelf = false
): number[] => {
  const item = findFromTreeItem(items, id);
  if (!item) {
    return [];
  }

  // const childrenIds = item.children.flatMap((child) =>
  const childrenIds: number[] = item.children.flatMap((child) =>
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
  parentId: number | null = 0,
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

    const children = flatten(item.children, Number(item.id), depth + 1);
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
export const findItem = (items: TreeItems, itemId: number) => {
  // itemId を number に変更
  return items.find(({ id }) => Number(id) === itemId); // number === number
};

/**
 * フラット化されたアイテム配列からツリー構造を構築する
 *
 * @param flattenItems
 * @returns
 */
export const buildTree = (flattenItems: FlattenedItems): TreeItems => {
  const root: TreeItem = {
    id: 0,
    name: "root",
    expanded: false,
    children: [],
    item_style: {},
  };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[String(parentId)] ?? findItem(items, parentId);

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
  itemId: number
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
export const removeItem = (items: TreeItems, itemId: number): TreeItems => {
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
  itemId: number,
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
export const getChildCount = (items: TreeItems, id: number): number => {
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
  parentIdsToExclude: number[]
) => {
  const excludeParentIds = new Set(parentIdsToExclude); // 型を明示

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
/**
 * ツリー構造から指定されたIDのアイテムを再帰的に削除します。
 * @param items - 処理対象の TreeItem の配列。
 * @param idToRemove - 削除するアイテムのID。
 * @returns 指定されたIDのアイテムが削除された新しい TreeItem の配列。
 */
export function removeItemDeep(
  items: TreeItem[],
  idToRemove: string | number // IDの型を string | number に変更
): TreeItem[] {
  return items.reduce((acc, item) => {
    if (String(item.id) === String(idToRemove)) {
      // IDを文字列として比較
      return acc; // 削除対象のアイテムなので、結果に追加しない
    }

    if (item.children && item.children.length > 0) {
      // 子アイテムがある場合は、子アイテムに対しても再帰的に削除処理を行う
      const newChildren = removeItemDeep(item.children, idToRemove);
      // 子アイテムが変更されたか、または元のアイテム自体が削除対象でなかった場合に結果に追加
      acc.push({ ...item, children: newChildren });
    } else {
      // 子アイテムがない場合は、そのまま結果に追加
      acc.push(item);
    }
    return acc;
  }, [] as TreeItem[]);
}
