// src/components/HabitItem/Management/ModalHabitItem.tsx
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreeItem } from "@/types/habit";

interface ModalHabitItemProps {
  item: TreeItem | null; // 編集対象のアイテムデータ、見つからない場合は null
  onItemChange: (updatedItem: Partial<TreeItem>) => void; // 変更を通知するコールバック
}

const ModalHabitItem: React.FC<ModalHabitItemProps> = ({
  item,
  onItemChange,
}) => {
  const [itemName, setItemName] = useState("");

  // item が変更されたら、ローカルの state (itemName) を更新
  useEffect(() => {
    if (item) {
      setItemName(item.name);
    } else {
      setItemName(""); // アイテムがない場合は空にする
    }
  }, [item]);

  // Input の値が変更されたときのハンドラ
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setItemName(newName);
    // 変更内容を親コンポーネントに通知
    // ID は変更しないので、変更された name だけを渡す
    if (item) {
      onItemChange({ name: newName });
    }
  };

  if (!item) {
    // item が null の場合は何も表示しないか、エラーメッセージを表示
    return <div>編集対象のアイテムが見つかりません。</div>;
  }

  return (
    <div className="grid gap-4">
      {/* 習慣名の編集 */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="habit-name" className="text-right">
          習慣名
        </Label>
        <Input
          id="habit-name"
          value={itemName}
          onChange={handleNameChange}
          className="col-span-3"
          placeholder="習慣名を入力..."
        />
      </div>
    </div>
  );
};

export default ModalHabitItem;
