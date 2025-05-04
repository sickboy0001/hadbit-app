// src/components/molecules/DialogHabitItem.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // DialogClose をインポート
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DialogHabitItemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string; // オプションで説明を追加できるように
  onSave: () => void; // 保存アクション
  // onCancel は onOpenChange(false) で代替できることが多いが、明示的に定義してもOK
  // onCancel: () => void;
  children: React.ReactNode; // 中身のコンポーネントを受け取る
}

const DialogEdit: React.FC<DialogHabitItemProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  children,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {/* サイズ調整はお好みで */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {/* 中身のコンポーネントをここにレンダリング */}
        <div className="py-4">{children}</div>
        <DialogFooter>
          {/* DialogClose でキャンセルボタンを作成 */}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </DialogClose>
          {/* 保存ボタン */}
          <Button type="button" onClick={onSave}>
            保存する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogEdit;
