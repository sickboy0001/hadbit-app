// src/components/HabitItem/Management/ModalHabitItem.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HabitItem } from "@/types/habit/habit_item";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ModalHabitItemProps {
  item: Partial<HabitItem> | null; // 編集中のデータ
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void; // Input/Textarea の変更ハンドラ
  onCheckboxChange: (name: string, checked: boolean) => void; // Checkbox の変更ハンドラ
  // item: TreeItem | null; // 編集対象のアイテムデータ、見つからない場合は null
  // onItemChange: (updatedItem: Partial<TreeItem>) => void; // 変更を通知するコールバック
}

// const ModalHabitItemTree: React.FC<ModalHabitItemProps> = ({
//   item,
//   onItemChange,
// }) => {

const ModalHabitItemTree: React.FC<ModalHabitItemProps> = ({
  item,
  onFormChange,
  onCheckboxChange,
}) => {
  if (!item) {
    // item が null の場合は何も表示しないか、ローディング表示などを出す
    return <div>読み込み中...</div>; // または null
  }

  if (!item) {
    // item が null の場合は何も表示しないか、エラーメッセージを表示
    return <div>編集対象のアイテムが見つかりません。</div>;
  }

  return (
    <div className="grid gap-4">
      {/* 習慣名の編集 */}
      {/* フォーム要素 (Input, Textarea, Checkbox など) */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
        {/* ラベルと入力の間の gap と、行間の gap */}
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          name="name"
          value={item.name || ""}
          onChange={onFormChange}
          className="col-span-3"
          required
        />
        <Label htmlFor="short_name" className="text-right">
          短縮名
        </Label>
        <Input
          id="short_name"
          name="short_name"
          value={item.short_name || ""}
          onChange={onFormChange}
          className="col-span-3"
        />
        <Label htmlFor="description" className="text-right">
          説明
        </Label>
        <Textarea
          id="description"
          name="description"
          value={item.description || ""}
          onChange={onFormChange}
          className="col-span-3"
        />
      </div>
      <div className="flex items-center  space-x-2 ">
        <Switch
          id="public_flag"
          // name="public_flag" // Switch に name 属性はない
          checked={!!item.public_flag}
          onCheckedChange={
            (checkedState) => onCheckboxChange("public_flag", checkedState) // Switch は boolean を直接返す
          }
        />
        <Label htmlFor="public_flag">公開する</Label>

        <Switch
          id="visible_flag"
          checked={item.visible_flag ?? true}
          onCheckedChange={(checkedState) =>
            onCheckboxChange("visible_flag", checkedState)
          }
        />
        <Label htmlFor="visible_flag">表示する</Label>
        <Switch
          id="delete_flag"
          checked={!!item.delete_flag}
          onCheckedChange={(checkedState) =>
            onCheckboxChange("delete_flag", checkedState)
          }
        />
        <Label htmlFor="delete_flag">削除済み (論理削除)</Label>
      </div>
    </div>
  );
};

export default ModalHabitItemTree;
