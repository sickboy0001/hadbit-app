import { HabitItem, HabitItemTree } from "@/types/habit/habit_item";
import { TreeItem } from "@/types/habit/ui"; // TreeItemWithHabit をインポート

/**
 * HabitItem のフラットリストを TreeItemWithHabit の階層構造に変換します。
 * 各 HabitItem に parent_id と order_no (ソート用、オプション) があることを前提とします。

 *
 * @param flatItems - HabitItem のフラットな配列
 * @returns TreeItemWithHabit の階層構造配列
 */
export function buildTreeWithHabitFromFlatList(
  // HabitItem に parent_id と order_no がない場合は、型を拡張するか、any を使う必要があります
  // ここでは仮に HabitItem & { parent_id?: number | null, order_no?: number | null } のような型を想定
  flatItems:
    | (HabitItem & { parent_id?: number | null; order_no?: number | null })[]
    | undefined
    | null
): TreeItem[] {
  if (!flatItems || flatItems.length === 0) {
    return [];
  }

  const itemMap: { [id: string]: TreeItem } = {};
  const rootItems: TreeItem[] = [];

  // 1. 各アイテムを TreeItemWithHabit に変換し、マップに格納
  flatItems.forEach((item) => {
    const treeNode: TreeItem = {
      id: item.id, // ID を文字列に変換
      name: item.name,
      item_style: item.item_style ? item.item_style : [],
      children: [],
      expanded: false, // 必要に応じて初期値を設定
    };
    itemMap[treeNode.id] = treeNode;
  });

  // 2. 親子関係を構築
  flatItems.forEach((item) => {
    const node = itemMap[String(item.id)];
    // const parentId = item.parent_id ? String(item.parent_id) : null; // parent_id を文字列に
    const parentId = item.parent_id != null ? String(item.parent_id) : null; // parent_id を文字列に (null/undefined チェック)

    if (parentId && itemMap[parentId]) {
      itemMap[parentId].children.push(node);
    } else {
      // parent_id がないか、対応する親がマップにない場合はルートアイテム
      rootItems.push(node);
    }
  });

  // // 3. 各階層で order_no に基づいてソート (order_no があれば)
  // const sortByOrderNo = (a: TreeItem, b: TreeItem) => {
  //   const orderA = (a. as any).order_no ?? Infinity; // order_no がなければ最後に
  //   const orderB = (b.habitItem as any).order_no ?? Infinity;
  //   return orderA - orderB;
  // };

  // rootItems.sort(sortByOrderNo);
  // Object.values(itemMap).forEach((node) => node.children.sort(sortByOrderNo));

  return rootItems;
}

interface ParentRelation {
  item_id: number;
  parent_id: number;
  order_no: number;
}

// 新しいツリー構築関数
export function buildTreeFromHabitAndParentReration(
  habitItems: HabitItem[],
  parentRelations: HabitItemTree[]
): TreeItem[] {
  const thisParentRelations: ParentRelation[] = parentRelations.map(
    (relationInput) => ({
      item_id: relationInput.item_id,
      parent_id: relationInput.parent_id ?? 0, // parent_id が null なら 0 (ルートの親)
      order_no: relationInput.order_no ?? Number.MAX_SAFE_INTEGER, // order_no が null なら大きな値 (ソートで最後に)
    })
  );
  // 1. habitItems を ID でルックアップできるように Map に変換
  const habitItemsMap = new Map<number, HabitItem>();
  habitItems.forEach((item) => habitItemsMap.set(item.id, item));

  // 2. parentRelations を parent_id ごとにグループ化し、order_no でソート
  // const childrenMap = new Map<number, []>();
  const childrenMap = new Map<number, ParentRelation[]>(); // 値の型を ParentRelation[] に変更
  thisParentRelations.forEach((relation) => {
    if (!childrenMap.has(relation.parent_id)) {
      childrenMap.set(relation.parent_id, []);
    }
    childrenMap.get(relation.parent_id)!.push(relation);
  });

  // 各親の子リストを order_no でソート
  childrenMap.forEach((children) => {
    children.sort((a, b) => a.order_no - b.order_no);
  });

  // 3. 再帰的にツリーを構築するヘルパー関数
  const buildNodeRecursive = (parentId: number): TreeItem[] => {
    const childRelations = childrenMap.get(parentId) || []; // 指定された親IDの子リレーションを取得、なければ空配列
    return childRelations
      .map((relation) => {
        const habitItem = habitItemsMap.get(relation.item_id);
        if (!habitItem) {
          console.warn(
            `Habit item with id ${relation.item_id} not found during tree build for parent ${parentId}. Skipping.`
          );
          return null; // データ不整合の場合は null を返す
        }
        return {
          id: habitItem.id, // TreeItem の id
          name: habitItem.short_name,
          item_style: habitItem.item_style,
          children: buildNodeRecursive(habitItem.id), // 再帰的に子ノードを構築
          expanded: false, // デフォルトは折りたたみ
          // 必要であれば habitItem 自体を含めることも検討できます:
          // habitItem: habitItem,
        };
      })
      .filter((item) => item !== null) as TreeItem[]; // null になったノードを除外
  };

  // ルートノード (parent_id が 0 のもの) から構築を開始
  // (実際のルートの parent_id が異なる場合は、その値に変更してください)
  return buildNodeRecursive(0);
}

/**
 * TreeItem 配列 (UIの状態) から、HabitItemTree の順序と親子関係を更新するための
 * フラットなデータ構造を生成します。
 * @param items 更新する TreeItem の配列。
 * @param parentId 現在処理中のアイテムたちの親ID。ルートレベルの場合は 0。
 * @returns HabitItemTree の更新に必要な { item_id: number; parent_id: number; order_no: number } の配列。
 */
export function flattenTreeForOrderUpdate(
  items: TreeItem[],
  parentId: number = 0 // ルートアイテムの親IDを0と仮定
): Array<{ item_id: number; parent_id: number; order_no: number }> {
  let result: Array<{ item_id: number; parent_id: number; order_no: number }> =
    [];

  items.forEach((item, index) => {
    const itemIdNum = item.id;
    if (isNaN(itemIdNum)) {
      console.warn(`Invalid item ID found: ${item.id}. Skipping.`);
      return;
    }
    result.push({ item_id: itemIdNum, parent_id: parentId, order_no: index });

    if (item.children && item.children.length > 0) {
      result = result.concat(
        flattenTreeForOrderUpdate(item.children, itemIdNum)
      );
    }
  });
  return result;
}
