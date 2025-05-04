"use client";
import React, { useCallback, useState } from "react";

import { initialItems } from "@/components/dnd-tree/dummy";
// import SortableTree from "@/components/dnd-tree/SortableTree";
import { TreeItem } from "@/types/habit";

import { Input } from "@/components/ui/input"; // shadcn/ui の Input をインポート
import { Button } from "@/components/ui/button"; // shadcn/ui の Button をインポート
import SortableTree from "@/components/dnd-tree/SortableTree";
import ConfirmationDialog from "@/components/molecules/ConfirmationDialog";
import ModalHabitItem from "./ModalHabitItem";
import DialogEdit from "@/components/molecules/DialogEdit";
import {
  findItemDeep,
  formatTreeForDebug,
  removeItemDeep,
  updateItemDeep,
} from "@/util/tree";

const ManagementTree: React.FC = () => {
  const [treeItems, setTreeItems] = useState<TreeItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState<string>(""); // Input用のstateを追加
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<string | null>(null);

  // --- 編集ダイアログ用 State ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // ★ 編集ダイアログの表示状態
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // ★ 編集対象のID
  const [editedItemData, setEditedItemData] =
    useState<Partial<TreeItem> | null>(null); // ★ 編集中のデータ

  // useCallback でラップして、SortableTree の不要な再レンダリングを防ぐ
  const handleItemsChange = useCallback((newItems: TreeItem[]) => {
    console.log("Tree items updated in ManagementTree:", newItems); // デバッグ用
    setTreeItems(newItems); // 受け取った新しいデータで状態を更新
  }, []); // 依存配列は空

  // 新しいアイテムを追加するハンドラー関数
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      // 入力が空または空白のみの場合は何もしない
      return;
    }

    // 新しいアイテムオブジェクトを作成
    const newItem: TreeItem = {
      // 簡単な一意ID生成（より堅牢な方法としてuuidなど推奨）
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newItemName.trim(), // 前後の空白を除去
      children: [], // 子アイテムはなし
      expanded: false, // 初期状態は折りたたみ
    };

    // 現在のツリーアイテム配列の末尾に新しいアイテムを追加
    setTreeItems((prevItems) => [...prevItems, newItem]);

    // Inputフィールドをクリア
    setNewItemName("");
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
  const handleRequestRemoveItem = useCallback((idToRemove: string) => {
    console.log("Requesting removal for item:", idToRemove); // デバッグ用
    setItemToRemoveId(idToRemove); // 削除対象のIDをstateに保存
    setIsAlertDialogOpen(true); // AlertDialogを開く
  }, []); // 依存配列は空

  // --- 編集関連 ---
  const handleEditItem = useCallback(
    (idToEdit: string) => {
      console.log("Requesting edit for item:", idToEdit);
      setEditingItemId(idToEdit); // ★ 編集対象IDをセット
      const item = findItemDeep(treeItems, idToEdit); // ★ 対象アイテムデータを検索
      setEditedItemData(item ? { name: item.name } : null); // ★ 初期編集データをセット (今は名前だけ)
      setIsEditDialogOpen(true); // ★ 編集ダイアログを開く
    },
    [treeItems]
  ); // ★ treeItems に依存

  // ★ 編集ダイアログの中身 (ModalHabitItem) からの変更を受け取る関数
  const handleModalItemChange = useCallback((updates: Partial<TreeItem>) => {
    setEditedItemData((prev) => ({ ...prev, ...updates })); // 変更内容を一時保存
  }, []);

  // ★ 編集ダイアログの保存ボタンが押されたときの処理
  const handleSaveEdit = () => {
    if (editingItemId && editedItemData) {
      console.log(
        "Saving edit for item:",
        editingItemId,
        "Data:",
        editedItemData
      );
      // ★ treeItems を更新
      setTreeItems((prevItems) =>
        updateItemDeep(prevItems, editingItemId, editedItemData)
      );
    }
    setIsEditDialogOpen(false); // ダイアログを閉じる
    setEditingItemId(null); // 編集対象IDをリセット
    setEditedItemData(null); // 編集中データをリセット
  };

  // ★ 編集ダイアログが閉じられたときの処理 (onOpenChange から呼ばれる)
  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      // ダイアログが閉じられたら状態をリセット
      setEditingItemId(null);
      setEditedItemData(null);
    }
    setIsEditDialogOpen(open);
  };

  // --- 削除を確定する関数 ---
  const handleConfirmRemoveItem = () => {
    if (itemToRemoveId) {
      setTreeItems((prevItems) => removeItemDeep(prevItems, itemToRemoveId));
    }
    setIsAlertDialogOpen(false); // ダイアログを閉じる
    setItemToRemoveId(null); // 削除対象IDをリセット
  };
  // --- ここまで ---
  const handleCancelRemoveItem = () => {
    setIsAlertDialogOpen(false); // ダイアログを閉じる
    setItemToRemoveId(null); // 削除対象IDをリセット
  };
  const getItemNameById = (id: string | null): string => {
    if (!id) return "";
    const findItem = (items: TreeItem[]): TreeItem | undefined => {
      for (const item of items) {
        if (Number(item.id) === Number(id)) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findItem(treeItems)?.name || String(id); // 見つからなければIDを返す
  };
  // 編集対象のアイテムデータを取得
  const currentEditingItem = editingItemId
    ? findItemDeep(treeItems, editingItemId)
    : null;

  const itemName = getItemNameById(itemToRemoveId);
  const dialogDeleteMesage = `アイテム「${itemName}」とその子アイテムがすべて削除されます。この操作は元に戻せません。`;
  const dialogDeleteTitle = `削除確認`;
  const dialogEditTitle = `アイテム編集: ${getItemNameById(editingItemId)}`;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="新しい習慣名を入力..."
          value={newItemName}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown} // Enterキー対応
          className="flex-grow" // 幅を自動調整
        />
        <Button onClick={handleAddItem}>追加</Button>
      </div>

      {/* SortableTree に現在の状態とコールバック関数を渡す */}
      <SortableTree
        defaultItems={treeItems} // 初期表示用に現在の状態を渡す
        onItemsChange={handleItemsChange} // 変更通知を受け取る関数を渡す
        onRemoveItem={handleRequestRemoveItem}
        onEditItem={handleEditItem}
      />
      {/* デバッグ用にフォーマットされた状態を表示 */}
      <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto whitespace-pre-wrap">
        {formatTreeForDebug(treeItems)}
      </pre>
      {/* デバッグ用に現在の状態を表示 */}
      {/* <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
        {JSON.stringify(treeItems, null, 2)}
      </pre> */}
      {/* ★ 元のAlertDialogの代わりにConfirmationDialogコンポーネントを使用 */}
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
          item={currentEditingItem} // ★ 現在編集中のアイテムデータを渡す
          onItemChange={handleModalItemChange} // ★ 中身の変更を受け取る関数を渡す
        />
      </DialogEdit>
    </div>
  );
};

export default ManagementTree;
