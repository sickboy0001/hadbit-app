"use client";
// http://192.168.2.102:3000/test/itemmentenance

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  createHabitItem,
  readHabitItems,
  updateHabitItem,
  deleteHabitItem,
} from "@/app/actions/habit_items";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Shadcn/ui の Toaster を使う場合
import { HabitItem } from "@/types/habit/habit_item";
import { useAuth } from "@/contexts/AuthContext";
import { formatUtcToJstString } from "@/lib/datetime";
import DialogEdit from "@/components/molecules/DialogEdit"; // ★ DialogEdit をインポート
import ModalHabitItem from "./ModalHabitItem";
import { createHabitItemTreeEntry } from "@/app/actions/habit_item_tree";

export function PageHabitItemsManager() {
  const [items, setItems] = useState<HabitItem[]>();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<HabitItem> | null>(
    null
  ); // 新規作成時は null, 編集時は対象 item
  const [newItemName, setNewItemName] = useState(""); // ★ 新規追加用の Input の state

  const { user, loading } = useAuth();

  // サーバーアクションの結果を反映するためにリストを再取得する関数
  const refreshItems = useCallback(() => {
    // user オブジェクトと user.userid の存在をより明確にチェックします。
    if (!user || typeof user.userid === "undefined") {
      return; // user または user.userid が未定義の場合は処理を中断
    }
    const currentUserId = user.userid; // この時点で currentUserId は number 型であることが保証されます

    startTransition(async () => {
      try {
        const updatedItems = await readHabitItems(currentUserId); // 型安全なIDを使用
        setItems(updatedItems);
      } catch (error) {
        toast.error("リストの更新に失敗しました。");
        console.error(error);
      }
    });
  }, [user, startTransition]); // user と startTransition を依存配列に追加

  useEffect(() => {
    // user 情報が取得できてからリストを読み込む
    if (user?.userid) {
      console.log("useEffect_userid:loading", loading);
      refreshItems();
    }
  }, [user?.userid, loading, refreshItems]); // refreshItems を依存配列に追加

  // 編集ダイアログを開く
  const handleOpenDialog = (item: HabitItem | null = null) => {
    setEditingItem(item ? { ...item } : { name: "" }); // 新規は空、編集はコピー
    setIsDialogOpen(true);
  };

  // フォームの値を更新
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingItem) return;
    const { name, value } = e.target;
    setEditingItem((prev) => ({
      ...prev,
      [name]: value, // value をそのままセット
    }));
  };

  // Checkbox の値を更新する専用ハンドラ
  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (!editingItem) return;
    setEditingItem((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  // 保存処理 (新規・更新)
  const handleSave = () => {
    if (!editingItem) return;

    startTransition(async () => {
      try {
        if (editingItem.id) {
          // 更新
          await updateHabitItem(editingItem.id, editingItem);
          toast.success("項目を更新しました。");
        } else {
          // 新規作成
          // editingItem は Partial<HabitItem> です。新規作成時、name は初期化されています。
          // createHabitItem が期待する型 (Omit<HabitItem, "id" | "user_id" | ...>) に合わせてペイロードを構築します。
          const payloadForCreate: Omit<
            HabitItem,
            | "id"
            | "user_id"
            | "visible_flag"
            | "delete_flag"
            | "updated_at"
            | "created_at"
          > = {
            name: editingItem.name!, // name は初期化により string であることが保証されます
            short_name:
              editingItem.short_name === undefined
                ? null
                : editingItem.short_name,
            description:
              editingItem.description === undefined
                ? null
                : editingItem.description,
            parent_flag:
              editingItem.parent_flag === undefined
                ? null
                : editingItem.parent_flag,
            public_flag:
              editingItem.public_flag === undefined
                ? null
                : editingItem.public_flag,
            // HabitItem に含まれ、かつ上記の Omit リストに含まれない他のプロパティがあれば、
            // 同様に undefined を null に変換するか、適切なデフォルト値を設定してここに追加してください。
          };
          await createHabitItem(user?.userid || 0, payloadForCreate);
          toast.success("項目を作成しました。");
        }
        setIsDialogOpen(false);
        setEditingItem(null);
        refreshItems(); // revalidatePath が効くはずだが、念のため呼んでも良い
      } catch (error) {
        toast.error("保存に失敗しました。");
        console.error(error);
      }
    });
  };
  // ★ Input から直接新規項目を追加する処理
  const handleAddNewItem = () => {
    if (!newItemName.trim()) {
      toast.warning("項目名を入力してください。");
      return;
    }

    startTransition(async () => {
      try {
        // 名前だけを持つ新しい項目データを作成
        const newItemData = { name: newItemName.trim() };
        // 1. habit_items に項目を作成し、結果 (IDを含む) を取得
        const createdItem = await createHabitItem(
          user?.userid || 0,
          newItemData
        );
        // 2. 取得した ID を使って habit_item_tree にエントリを作成
        await createHabitItemTreeEntry(createdItem.id, 0);
        toast.success(`「${createdItem.name}」を作成しました。`);

        setNewItemName(""); // Input をクリア
        refreshItems(); // リストを更新
      } catch (error) {
        toast.error("項目の作成に失敗しました。");
        console.error(error);
      }
    });
  };
  // 削除処理
  const handleDelete = (id: number) => {
    startTransition(async () => {
      try {
        await deleteHabitItem(id);
        toast.success("項目を削除しました。");
        refreshItems(); // revalidatePath が効くはずだが、念のため呼んでも良い
      } catch (error) {
        toast.error("削除に失敗しました。");
        console.error(error);
      }
    });
  };

  return (
    <div>
      {/* ★ 新規項目追加用の Input と Button */}
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="新しい習慣名を入力..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddNewItem();
            }
          }}
          className="flex-grow"
        />
        <Button
          onClick={handleAddNewItem}
          disabled={isPending || !newItemName.trim()}
        >
          {isPending ? "追加中..." : "追加"}
        </Button>
      </div>

      {/* ★ DialogEdit コンポーネントを使用 */}
      <DialogEdit
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen} // ダイアログの開閉状態を管理
        title={"項目編集"} // タイトルを動的に設定
        onSave={handleSave} // 保存ボタンのアクションを設定
        // isSaving={isPending} // 保存処理中かどうかを渡す (DialogEdit側でボタン表示制御する場合)
      >
        {/* ★ ModalHabitItem コンポーネントを呼び出し、Props を渡す */}
        <ModalHabitItem
          item={editingItem}
          onFormChange={handleFormChange}
          onCheckboxChange={handleCheckboxChange}
        />
      </DialogEdit>

      <h1 className="text-3xl font-bold mb-6">習慣項目メンテナンス</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>名前</TableHead>
            <TableHead>説明</TableHead>
            <TableHead>作成日時</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items &&
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description?.substring(0, 50)}...</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatUtcToJstString(item.created_at)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(item)}
                  >
                    編集
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        削除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          本当に削除しますか？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は元に戻せません。「{item.name}
                          」を削除します。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id)}
                          disabled={isPending}
                        >
                          {isPending ? "削除中..." : "削除"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {isPending && <div className="text-center mt-4">処理中...</div>}
    </div>
  );
}
