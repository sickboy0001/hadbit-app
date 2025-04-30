"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
  closestCenter,
  UniqueIdentifier,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FlattenedItem, SensorContext, TreeItem } from "./types";
import { buildTree, flattenTree, getChildrenIds, getProjection } from "./utils";

const DEFAULT_INDENTATION_WIDTH = 50;

// フックの引数に onItemsChange を追加
type UseSortableTreeOptions = {
  defaultItems: TreeItem[];
  onItemsChange: (items: TreeItem[]) => void; // ★ コールバック関数を受け取る
  onRemoveItem: (id: string) => void;
  indentationWidth?: number;
  indicator?: boolean;
};

export const useSortableTree = ({
  defaultItems,
  onItemsChange,
  onRemoveItem,
  indentationWidth = DEFAULT_INDENTATION_WIDTH,
  indicator = false,
}: UseSortableTreeOptions) => {
  const [items, setItems] = useState(() => defaultItems); // 初期化は一度だけ
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const [expandedIds, setExpandedIds] = useState<UniqueIdentifier[]>([]);

  // defaultItems プロップの変更を監視し、内部状態 `items` を同期させる
  useEffect(() => {
    // 参照比較で変更を検知。より厳密な比較が必要な場合もある。
    // 親コンポーネントで状態更新時に新しい配列が生成されていることを期待。
    if (defaultItems !== items) {
      setItems(defaultItems);
      // もし defaultItems の変更によって他の状態もリセット/更新する必要があればここで行う
      // 例: setExpandedIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultItems]); // defaultItems が変更されたらこの Effect を実行

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const expandedItems = flattenedTree.filter(
      ({ parentId }) => parentId === null || expandedIds.includes(parentId)
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

  const handleDragStart = useCallback(
    ({ active: { id: activeId } }: DragStartEvent) => {
      setActiveId(activeId);
      setOverId(activeId);

      const childrenIds = getChildrenIds(flattenedItems, activeId);
      setExpandedIds((expandedIds) =>
        expandedIds.filter(
          (expandedId) =>
            expandedId !== activeId && !childrenIds.includes(expandedId)
        )
      );

      document.body.style.setProperty("cursor", "grabbing");
    },
    [flattenedItems]
  );

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  };

  /**
   * ドラッグ操作が終了したときに呼び出されるハンドラ
   * @param {DragEndEvent} event - ドラッグ終了イベントオブジェクト
   * @param {object} event.active - ドラッグされたアイテムの情報
   * @param {object | null} event.over - ドロップ先のアイテムの情報 (存在する場合)
   */
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    // まず、ドラッグ操作に関連する一時的な状態 (activeId, overId, offsetLeft など) をリセット
    resetState();

    // projected (ドロップ位置の予測情報) と over (ドロップ先の情報) の両方が存在する場合のみ処理を実行
    // ドロップ先が有効でない場合や、予測が計算されていない場合は何もしない
    if (projected && over) {
      const { depth: newDepth, parentId: newParentId } = projected;

      // ★ 変更点1: 完全なツリー `items` をフラット化し、ディープコピーして操作する
      const fullFlattenedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items)) // items ステートからフラット化
      );

      // 移動元 (active) と移動先 (over) のアイテムを完全なリストから検索
      const activeIndex = fullFlattenedItems.findIndex(
        ({ id }) => id === active.id
      );
      const overIndex = fullFlattenedItems.findIndex(
        ({ id }) => id === over.id
      );

      // アイテムが見つからない場合はエラーとして処理中断
      if (activeIndex === -1 || overIndex === -1) {
        console.error(
          "Active or Over item not found in the full flattened list."
        );
        return;
      }

      // ★ 変更点2: 移動するアイテムの depth と parentId を更新
      const activeItem = fullFlattenedItems[activeIndex];
      activeItem.depth = newDepth;
      activeItem.parentId = newParentId;

      // ★ 変更点3: 移動するアイテムの子孫要素の depth を再帰的に更新する関数
      const updateChildrenDepth = (
        parentId: UniqueIdentifier,
        parentDepth: number,
        list: FlattenedItem[]
      ) => {
        list.forEach((item) => {
          // 対象の親IDを持つアイテムを探す
          if (item.parentId === parentId) {
            // 新しい depth を計算して設定
            const currentDepth = parentDepth + 1;
            item.depth = currentDepth;
            // さらにその子要素に対しても再帰的に実行
            updateChildrenDepth(item.id, currentDepth, list);
          }
        });
      };

      // 移動したアイテム (active.id) を起点に子孫の depth 更新を開始
      updateChildrenDepth(active.id, newDepth, fullFlattenedItems);

      // ★ 変更点4: depth と parentId が更新されたリストでアイテムの順序を移動
      // arrayMove は新しい配列を返すので、結果を変数に格納
      const sortedFlattenedItems = arrayMove(
        fullFlattenedItems,
        activeIndex,
        overIndex
      );

      // ★ 変更点5: 正しく更新・並び替えられたフラットリストからツリー構造を再構築
      const newTree = buildTree(sortedFlattenedItems);

      // ★ 変更点6: 展開状態を更新 (新しい親を展開する)
      setExpandedIds((currentExpandedIds) => {
        const newExpandedIds = [...currentExpandedIds];
        // 新しい親が存在し、まだ展開されていなければ展開リストに追加
        if (newParentId && !newExpandedIds.includes(newParentId)) {
          newExpandedIds.push(newParentId);
        }
        // 必要に応じて、移動したアイテムの子孫を閉じるロジックもここに追加できます
        // 例: const childrenIds = getAllDescendantIds(active.id, sortedFlattenedItems);
        //     const filtered = newExpandedIds.filter(id => !childrenIds.includes(id));
        //     return Array.from(new Set(filtered));
        return Array.from(new Set(newExpandedIds));
      });
      // 状態を更新し、コールバックを呼び出す
      setItems(newTree);
      onItemsChange(newTree); // ★ 変更後のツリーデータをコールバックで通知

      // // ドラッグされたアイテムまたはドロップ先アイテムがリスト内に見つからなかった場合 (インデックスが -1) は、
      // // 予期せぬ状態のため、処理を中断して何も変更しない

      // // clonedItems からドラッグされたアイテムの情報を取得
      // const activeItem = clonedItems[activeIndex];
      // // ドラッグされたアイテム (activeItem) のすべての子孫要素のIDリストを取得
      // // (注意: getChildrenIds は現在の実装ではフラットリストを引数に取るが、
      // //        ツリー構造から取得する方が正確な場合があるかもしれない)
      // const childrenIds = getChildrenIds(clonedItems, activeItem.id);

      // // ドラッグされたアイテム (activeIndex の位置にある要素) の情報を更新
      // // 新しい深さ (depth) と親ID (parentId) を projected の値で上書きする
      // clonedItems[activeIndex] = { ...activeItem, depth, parentId };

      // // clonedItems (フラットリスト) 内のすべてのアイテムに対してループ処理を実行
      // clonedItems.forEach((item) => {
      //   // もし現在のアイテム (item) が、ドラッグされたアイテムの子孫 (childrenIds に含まれる) であれば
      //   if (childrenIds.includes(item.id)) {
      //     // その子孫アイテムの深さ (depth) を、ドラッグされたアイテムの新しい深さ + 1 に更新する
      //     // (注意: この単純なロジックは、子孫間の相対的な深さを維持しない可能性がある。
      //     //        より正確には、元の深さからの差分 (depth - activeItem.depth) を加算する方が良い場合が多い)
      //     item.depth = depth + 1;
      //   }
      // });

      // // 更新された clonedItems (深さと親IDが変更されたリスト) に対して、アイテムの順序を移動させる
      // // arrayMove 関数を使い、activeIndex の位置にあったアイテムを overIndex の位置に移動させる
      // const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      // // 順序と階層情報が更新されたフラットリスト (sortedItems) から、新しいツリー構造 (TreeItems) を再構築する
      // const newItems = buildTree(sortedItems);

      // // ツリーの展開状態 (expandedIds) を更新する
      // setExpandedIds((currentExpandedIds) => {
      //   // まず、現在の展開状態から、移動したアイテムの子孫で展開されていたものを除外する (閉じる)
      //   const newExpandedIds = currentExpandedIds.filter(
      //     (id) => !childrenIds.includes(id)
      //   );
      //   // もし新しい親が存在すれば (つまり、ルート以外にドロップされた場合)
      //   if (parentId) {
      //     // その新しい親アイテムを展開状態にする (リストに追加)
      //     // これにより、アイテムをフォルダに入れた際にそのフォルダが自動的に開くようになる
      //     newExpandedIds.push(parentId);
      //   }

      //   // Set を使って重複するIDを除去し、最終的な展開状態の配列を返す
      //   return Array.from(new Set(newExpandedIds));
      // });

      // // コンポーネントの state (items) を、再構築された新しいツリー構造 (newItems) で更新する
      // // これにより、UIに変更が反映される
      // setItems(newItems);
    }
  };

  const handleDragCancel = () => {
    resetState();
  };

  const handleToggleExpand = useCallback(
    (id: UniqueIdentifier) => {
      setExpandedIds((expandedIds) => {
        if (expandedIds.includes(id)) {
          const childrenIds = getChildrenIds(items, id);
          return expandedIds.filter(
            (expandedId) =>
              expandedId !== id && !childrenIds.includes(expandedId)
          );
        } else {
          return [...new Set([...expandedIds, id])];
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
      onRemove: onRemoveItem,
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
