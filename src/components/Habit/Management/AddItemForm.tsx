import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddItemFormProps {
  newItemName: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onAddItem: () => void;
  isAdding?: boolean; // 追加処理中かどうか（オプション）
}

const AddItemForm: React.FC<AddItemFormProps> = ({
  newItemName,
  onInputChange,
  onInputKeyDown,
  onAddItem,
  isAdding = false, // デフォルトは false
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        type="text"
        placeholder="新しい習慣名を入力..."
        value={newItemName}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        className="flex-grow"
        disabled={isAdding} // 処理中は無効化
      />
      <Button onClick={onAddItem} disabled={isAdding || !newItemName.trim()}>
        {isAdding ? "追加中..." : "追加"}
      </Button>
    </div>
  );
};
{
  /* <Input
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
</Button> */
}
export default AddItemForm;
