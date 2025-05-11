// src/components/HabitItem/Management/ConfirmationDialog.tsx
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// コンポーネントが受け取るPropsの型を定義
interface ConfirmationDialogProps {
  open: boolean; // ダイアログの表示状態
  onOpenChange: (open: boolean) => void; // ダイアログの表示状態が変更されたときのコールバック
  dialogTitle: string; // 表示するアイテム名
  dialogMessage: string; // 表示するアイテム名
  confiremButtonName: string;
  onConfirm: () => void; // 「削除する」ボタンがクリックされたときのコールバック
  onCancel: () => void; // 「キャンセル」ボタンがクリックされたときのコールバック
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  dialogTitle,
  dialogMessage,
  confiremButtonName,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* Trigger は呼び出し元で制御するため不要 */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            {dialogMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Propsで受け取ったキャンセル処理を実行 */}
          <AlertDialogCancel onClick={onCancel}>キャンセル</AlertDialogCancel>
          {/* Propsで受け取った確定処理を実行 */}
          <AlertDialogAction onClick={onConfirm}>
            {confiremButtonName}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
