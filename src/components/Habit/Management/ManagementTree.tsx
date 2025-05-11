"use client";
import React, { useCallback, useEffect, useState, useTransition } from "react";

import ConfirmationDialog from "@/components/molecules/ConfirmationDialog";
import DialogEdit from "@/components/molecules/DialogEdit";
import { TreeItem } from "@/types/habit/ui";
import AddItemForm from "./AddItemForm"; // ★ 新しいコンポーネントをインポート
import TreeDisplay from "./TreeDisplay"; // ★ 新しいコンポーネントをインポート
import { useAuth } from "@/contexts/AuthContext";
import {
  createHabitItem,
  deleteHabitItemPhysically,
  readHabitItems,
  readHabitItemTreeWithUserId,
  updateHabitItem,
  updateHabitItemTreeOrder,
} from "@/app/actions/habit_items";
import { toast } from "sonner";
import { createHabitItemTreeEntry } from "@/app/actions/habit_item_tree";
import ModalHabitItem from "./ModalHabitItem";
import { HabitItem, HabitItemWithTreeInfo } from "@/types/habit/habit_item";
import { findItemDeep, removeItemDeep } from "@/components/dnd-tree/utils";
import {
  buildTreeFromHabitAndParentReration,
  flattenTreeForOrderUpdate,
} from "@/util/treeConverter";
const ManagementTree: React.FC = () => {
  const [isPending, startTransition] = useTransition(); // ★ トランジションフック
  const [habitItems, setHabitItems] = useState<HabitItem[]>([]);
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]); // ★ 初期値を空配列に変更
  const { user, loading: authLoading } = useAuth(); // ★ 認証状態を取得

  const [newItemName, setNewItemName] = useState<string>(""); // Input用のstateを追加
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<number | null>(null);

  // --- 編集ダイアログ用 State ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // ★ 編集ダイアログの表示状態
  const [editingItemId, setEditingItemId] = useState<number | null>(null); // ★ 編集対象のID
  // ★ 編集中のデータ (HabitItem の一部)
  const [editedItemData, setEditedItemData] =
    useState<Partial<HabitItemWithTreeInfo> | null>(null);

  const refreshItems = useCallback(() => {
    if (!user?.userid) return; // ユーザーIDがない場合は何もしない
    if (user === undefined) return; // ユーザーIDがない場合は何もしない
    const userId = user.userid;
    startTransition(async () => {
      try {
        const nowHabitItems = await readHabitItems(userId);
        // console.log("nowHabitItems", nowHabitItems);
        const nowHabitItemTree = await readHabitItemTreeWithUserId(userId);
        // console.log("nowParentRelation", nowHabitItemTree);
        setHabitItems(nowHabitItems);

        const nowTreeItems = buildTreeFromHabitAndParentReration(
          nowHabitItems,
          nowHabitItemTree
        );
        console.log("nowTreeItems", nowTreeItems);
        setTreeItems(nowTreeItems);
      } catch (error) {
        toast.error("リストの読み込みに失敗しました。");
        console.error("Failed to fetch habit items:", error);
      }
    });
  }, [user]); // user.userid が変わったら再生成

  useEffect(() => {
    if (user?.userid) {
      refreshItems();
    }
  }, [user?.userid, refreshItems]); // refreshItems も依存配列に追加

  // ソート順Order順の変更
  const handleItemsOrderChange = useCallback(
    (newItems: TreeItem[]) => {
      // 1. ローカルの State を即時更新して UI に反映
      setTreeItems(newItems);
      console.log("handleItemsOrderChange", newItems);

      // 2. サーバーに更新データを送信
      startTransition(async () => {
        try {
          const updateData = flattenTreeForOrderUpdate(newItems);
          console.log("updateData", updateData);
          await updateHabitItemTreeOrder(updateData);
          toast.success("表示順序を更新しました。");
        } catch (error) {
          toast.error("表示順序の更新に失敗しました。");
          console.log(error);
          refreshItems(); // エラー時はサーバーから再取得してUIを元に戻す
        }
      });
    },
    [refreshItems, startTransition] // startTransition を依存配列に追加
  );

  // 新しいアイテムを追加するハンドラー関数
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      // 入力が空または空白のみの場合は何もしない
      return;
    }
    if (!user?.userid) return; // ユーザーIDがない場合は何もしない
    if (user === undefined) return; // ユーザーIDがない場合は何もしない
    const userId = user.userid;

    startTransition(async () => {
      try {
        // 名前だけを持つ新しい項目データを作成
        const newItemData = {
          name: newItemName.trim(),
          short_name: newItemName.trim(),
          description: newItemName.trim(),
        };
        // 1. habit_items に項目を作成し、結果 (IDを含む) を取得
        const createdItem = await createHabitItem(userId, newItemData);
        // 2. 取得した ID を使って habit_item_tree にエントリを作成
        await createHabitItemTreeEntry(createdItem.id, 0);
        toast.success(`「${createdItem.name}」を作成しました。`);

        const newItem: TreeItem = {
          id: createdItem.id,
          name: newItemName.trim(), // 前後の空白を除去
          children: [], // 子アイテムはなし
          expanded: false, // 初期状態は折りたたみ
        };

        // 現在のツリーアイテム配列の末尾に新しいアイテムを追加
        setTreeItems((prevItems) => [...prevItems, newItem]);

        // refreshItems(); // リストを更新
      } catch (error) {
        toast.error("項目の作成に失敗しました。");
        console.error(error);
      }
      setNewItemName(""); // Input をクリア
    });
  };

  // Inputフィールドの変更をハンドルする関数
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemName(event.target.value);
  };

  // Enterキーで追加できるようにするハンドラー (オプション)
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddItem();
    }
  };

  // window.confirm の代わりに AlertDialog を開く
  const handleRequestRemoveItem = useCallback((idToRemove: number) => {
    console.log("Requesting removal for item:", idToRemove); // デバッグ用
    setItemToRemoveId(idToRemove); // 削除対象のIDをstateに保存
    setIsAlertDialogOpen(true); // AlertDialogを開く
  }, []); // 依存配列は空

  // --- 編集関連 ---
  const handleEditItem = useCallback(
    (idToEdit: number) => {
      setEditingItemId(idToEdit);

      const targetHabitItem = habitItems.find((item) => item.id === idToEdit);

      if (targetHabitItem) {
        const dataForModal: Partial<HabitItemWithTreeInfo> = {
          ...targetHabitItem, // スプレッド構文で HabitItem のプロパティをコピー
        };
        setEditedItemData(dataForModal);
      } else {
        setEditedItemData(null); // アイテムが見つからない場合は null を設定
        toast.error(`ID ${idToEdit} のアイテムが見つかりませんでした。`);
        console.error(
          `HabitItem with ID ${idToEdit} not found in habitItems state.`
        );
      }
      setIsEditDialogOpen(true); // 編集ダイアログを開く
    },
    [habitItems]
  ); //  treeItems に依存

  //  編集ダイアログの中身 (ModalHabitItem) からの変更を受け取る関数
  const handleModalItemChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditedItemData((prev) => (prev ? { ...prev, [name]: value } : null)); // ★ Partial<HabitItem> を更新
    },
    []
  );

  //  編集ダイアログの保存ボタンが押されたときの処理
  const handleSaveEdit = () => {
    console.log("handleSaveEdit called", editingItemId, editedItemData);
    if (editingItemId && editedItemData) {
      console.log(
        "Saving edit for item:",
        editingItemId,
        "Data:",
        editedItemData
      );
      // ★ DB 更新と Tree 更新
      startTransition(async () => {
        try {
          const itemIdNum = editingItemId;
          if (isNaN(itemIdNum)) throw new Error("Invalid item ID");

          // 1. DB の HabitItem を更新 (updateHabitItem アクションが必要)
          console.log("handelsaveedit", editedItemData);
          // const { parent_id, order_no, ...habitItemData } = editedItemData;

          // DBのHabitItemを更新
          const updatedHabitItemFromDB = await updateHabitItem(
            itemIdNum,
            editedItemData
          );

          // 2. ローカルの habitItems ステートを更新
          setHabitItems((prevHabitItems) =>
            prevHabitItems.map((item) =>
              item.id === itemIdNum
                ? { ...item, ...updatedHabitItemFromDB } // DBからの最新情報で更新
                : item
            )
          );

          // 3. ローカルの treeItems ステートの name プロパティのみを更新
          //    親子関係や展開状態は維持する
          if (updatedHabitItemFromDB.name !== undefined) {
            const updateNameRecursively = (
              itemsToUpdate: TreeItem[]
            ): TreeItem[] => {
              return itemsToUpdate.map((item) => {
                if (item.id === itemIdNum) {
                  // IDが一致したら名前を更新
                  return { ...item, name: updatedHabitItemFromDB.name! };
                }
                if (item.children && item.children.length > 0) {
                  // 子アイテムがあれば再帰的に処理
                  return {
                    ...item,
                    children: updateNameRecursively(item.children),
                  };
                }
                return item; // それ以外はアイテムをそのまま返す
              });
            };
            setTreeItems((prevTreeItems) =>
              updateNameRecursively(prevTreeItems)
            );
          }

          toast.success("項目を更新しました。");
        } catch (error) {
          toast.error("更新に失敗しました。");
          console.error("Failed to save edit:", error);
        }
      });
    }
    setIsEditDialogOpen(false); // ダイアログを閉じる
    setEditingItemId(null); // 編集対象IDをリセット
    setEditedItemData(null); // 編集中データをリセット
  };

  // 編集ダイアログが閉じられたときの処理 (onOpenChange から呼ばれる)
  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      // ダイアログが閉じられたら状態をリセット
      setEditingItemId(null);
      setEditedItemData(null);
    }
    setIsEditDialogOpen(open);
  };

  // Helper function to collect item and its descendant IDs in post-order (children before parent)
  // This ensures that children are processed (for deletion) before their parent.
  const getIdsForDeletionPostOrder = (item: TreeItem): number[] => {
    let ids: number[] = [];
    if (item.children) {
      for (const child of item.children) {
        ids = ids.concat(getIdsForDeletionPostOrder(child)); // Recursively get children's IDs
      }
    }
    ids.push(item.id); // Add current item's ID after all its children
    return ids;
  };

  const handleConfirmRemoveItem = () => {
    if (!itemToRemoveId) return;

    const topLevelItemIdToRemove = itemToRemoveId;

    startTransition(async () => {
      try {
        // 1. 削除対象のアイテムとそのすべての子孫アイテムのIDを特定する
        //    (子孫から親の順序でIDが並ぶようにする)
        const itemToDeleteInTree = findItemDeep(
          treeItems,
          topLevelItemIdToRemove
        );
        let idsToDeleteFromDB: number[] = [];

        if (itemToDeleteInTree) {
          idsToDeleteFromDB = getIdsForDeletionPostOrder(itemToDeleteInTree);
        } else {
          // ローカルツリーに見つからない場合でも、指定されたIDの削除を試みる
          idsToDeleteFromDB = [topLevelItemIdToRemove];
        }

        // 2. 特定されたIDのアイテムをDBから物理削除 (子から親の順で削除される)
        for (const id of idsToDeleteFromDB) {
          if (isNaN(id)) throw new Error(`Invalid item ID for deletion: ${id}`);
          await deleteHabitItemPhysically(id);
        }

        // 3. ローカルの State から削除 (UIの更新)
        // removeItemDeep は指定されたIDのアイテムとその子をローカルツリーから削除する
        setTreeItems((prevItems) =>
          removeItemDeep(prevItems, topLevelItemIdToRemove)
        );
        toast.success("項目とその子項目を削除しました。");
      } catch (error) {
        toast.error("削除に失敗しました。");
        console.error("Failed to remove item:", error);
      } finally {
        setIsAlertDialogOpen(false); // ダイアログを閉じる
        setItemToRemoveId(null); // 削除対象IDをリセット
      }
    });
    setItemToRemoveId(null); // 削除対象IDをリセット
  };

  const handleCancelRemoveItem = () => {
    setIsAlertDialogOpen(false); // ダイアログを閉じる
    setItemToRemoveId(null); // 削除対象IDをリセット
  };

  const getItemNameById = (id: string | null): string => {
    if (!id) return ""; // ID がなければ空文字
    // ★ findItemDeep を使って TreeItemWithHabit を検索
    const item = findItemDeep(treeItems, Number(id));
    // ★ 見つかれば habitItem.name、なければ ID を返す
    return item?.name || String(id);
  };

  // Checkbox の値を更新する専用ハンドラ
  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (!editedItemData) return;
    setEditedItemData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const dialogDeleteMesage = `アイテム「${getItemNameById(
    String(editingItemId)
  )}」とその子アイテムがすべて削除されます。この操作は元に戻せません。`;
  const dialogDeleteTitle = `削除確認`;
  const dialogEditTitle = `アイテム編集: ${getItemNameById(
    String(editingItemId)
  )}`;
  // ★ 認証情報読み込み中またはデータ取得中の表示
  if (authLoading) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }

  return (
    <div>
      {/* ★ 新規アイテム追加フォームコンポーネント */}
      <AddItemForm
        newItemName={newItemName}
        onInputChange={handleInputChange}
        onInputKeyDown={handleInputKeyDown}
        onAddItem={handleAddItem}
        isAdding={isPending}
      />

      {/* SortableTree に現在の状態とコールバック関数を渡す */}
      {/* ★ ツリー表示コンポーネント */}
      <TreeDisplay
        treeItems={treeItems}
        onItemsChange={handleItemsOrderChange}
        onRemoveItem={handleRequestRemoveItem}
        onEditItem={handleEditItem}
      />
      <ConfirmationDialog
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
        dialogTitle={dialogDeleteTitle}
        confiremButtonName="削除する"
        dialogMessage={dialogDeleteMesage} // ★ アイテム名を取得して渡す
        onConfirm={handleConfirmRemoveItem} // ★ 確定処理を渡す
        onCancel={handleCancelRemoveItem} // ★ キャンセル処理を渡す
      />
      {/* ★ 編集ダイアログ */}
      <DialogEdit
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogClose} // ★ 閉じる処理を渡す
        title={dialogEditTitle} // ★ タイトルを設定
        onSave={handleSaveEdit} // ★ 保存処理を渡す
      >
        {/* ★ ダイアログの中身として ModalHabitItem をレンダリング */}
        <ModalHabitItem
          // item={currentEditingItem} // ★ 現在編集中のアイテムデータを渡す
          item={editedItemData} // ★ 編集中の一時データ (Partial<HabitItem>) を渡す
          onFormChange={handleModalItemChange} // ★ 中身の変更を受け取る関数を渡す
          onCheckboxChange={handleCheckboxChange}
        />
      </DialogEdit>
    </div>
  );
};

export default ManagementTree;
