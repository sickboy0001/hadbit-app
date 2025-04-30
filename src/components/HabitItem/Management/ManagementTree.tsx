"use client";
import React, { useCallback, useState } from "react";

import { initialItems } from "@/components/dnd-tree/dummy";
// import SortableTree from "@/components/dnd-tree/SortableTree";
import { TreeItem } from "@/components/dnd-tree/types";

import { Input } from "@/components/ui/input"; // shadcn/ui の Input をインポート
import { Button } from "@/components/ui/button"; // shadcn/ui の Button をインポート
import SortableTree from "@/components/dnd-tree/SortableTree";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger, // Trigger は今回は使わない
} from "@/components/ui/alert-dialog";
// デバッグ表示用にツリーデータを指定形式の文字列にフォーマットするヘルパー関数
const formatTreeForDebug = (items: TreeItem[]): string => {
  let result = "";

  // 再帰的に処理する内部関数を定義
  // parentId を引数に追加
  const formatRecursive = (
    items: TreeItem[],
    indent: string = "",
    parentId: string | null = "0" // 親IDを受け取る引数を追加 (トップレベルは 0)
  ) => {
    // forEach の第二引数でインデックスを取得
    items.forEach((item, index) => {
      // 現在のアイテムを追加 (インデント ID：名前 (index: インデックス, parentId: 親ID))
      // parentId が null の場合は 'null' と表示
      result += `${indent}${item.id}：${
        item.name
      } (index: ${index}, parentId: ${parentId ?? "null"})\n`;

      // 子アイテムが存在し、空でなければ再帰的に処理
      if (item.children && item.children.length > 0) {
        // インデントを増やし、現在の item.id を parentId として渡して再帰呼び出し
        formatRecursive(item.children, indent + "　", item.id); // item.id を parentId として渡す
      }
    });
  };

  formatRecursive(items); // 再帰処理を開始 (トップレベルなので parentId はデフォルトの null)
  return result;
};

// --- アイテム削除用のヘルパー関数 ---
// utils.ts に移すのが望ましい
const removeItemDeep = (items: TreeItem[], idToRemove: string): TreeItem[] => {
  return items.reduce((acc, item) => {
    if (item.id === idToRemove) {
      return acc; // このアイテムを除外
    }
    if (item.children && item.children.length > 0) {
      // 子要素に対しても再帰的に削除処理を実行
      const newChildren = removeItemDeep(item.children, idToRemove);
      // 子要素が変更された場合のみ新しいオブジェクトを作成
      if (newChildren !== item.children) {
        acc.push({ ...item, children: newChildren });
        return acc;
      }
    }
    acc.push(item); // このアイテムは保持
    return acc;
  }, [] as TreeItem[]); // 型アサーションを追加
};
// --- ここまでヘルパー関数 ---
const ManagementTree: React.FC = () => {
  const [treeItems, setTreeItems] = useState<TreeItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState<string>(""); // Input用のstateを追加
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<string | null>(null);
  // SortableTree から変更通知を受け取るコールバック関数
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

  const handleRemoveItem = useCallback((idToRemove: string) => {
    console.log("Removing item:", idToRemove); // デバッグ用
    if (
      window.confirm(
        `アイテム「${idToRemove}」を削除してもよろしいですか？\n(子アイテムもすべて削除されます)`
      )
    ) {
      setTreeItems((prevItems) => removeItemDeep(prevItems, idToRemove));
    }
  }, []);

  // --- 削除確認ダイアログを開く関数 ---
  // const openConfirmationDialog = useCallback((idToRemove: string) => {
  //   setItemToRemoveId(idToRemove); // 削除対象のIDをセット
  //   setIsAlertDialogOpen(true); // ダイアログを開く
  // }, []);
  // --- ここまで ---

  // --- 削除を確定する関数 ---
  const confirmRemoveItem = () => {
    if (itemToRemoveId) {
      setTreeItems((prevItems) => removeItemDeep(prevItems, itemToRemoveId));
    }
    setIsAlertDialogOpen(false); // ダイアログを閉じる
    setItemToRemoveId(null); // 削除対象IDをリセット
  };
  // --- ここまで ---
  const cancelRemoveItem = () => {
    setIsAlertDialogOpen(false); // ダイアログを閉じる
    setItemToRemoveId(null); // 削除対象IDをリセット
  };
  const getItemNameById = (id: string | null): string => {
    if (!id) return "";
    const findItem = (items: TreeItem[]): TreeItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findItem(treeItems)?.name || String(id); // 見つからなければIDを返す
  };
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
        onRemoveItem={handleRemoveItem}
      />
      {/* デバッグ用にフォーマットされた状態を表示 */}
      <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto whitespace-pre-wrap">
        {formatTreeForDebug(treeItems)}
      </pre>
      {/* デバッグ用に現在の状態を表示 */}
      {/* <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
        {JSON.stringify(treeItems, null, 2)}
      </pre> */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        {/* Trigger は使わないのでコメントアウトまたは削除 */}
        {/* <AlertDialogTrigger asChild>
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              アイテム「{getItemNameById(itemToRemoveId)}
              」とその子アイテムがすべて削除されます。この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* キャンセルボタン */}
            <AlertDialogCancel onClick={cancelRemoveItem}>
              キャンセル
            </AlertDialogCancel>
            {/* 削除実行ボタン */}
            <AlertDialogAction onClick={confirmRemoveItem}>
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManagementTree;
