import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Checkbox を Switch に変更
import { HabitItem, HabititemItemStyle } from "@/types/habit/habit_item";
import { color_def } from "@/constants/habitStyle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalHabitItemProps {
  item: Partial<HabitItem> | null; // 編集中のデータ
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void; // Input/Textarea の変更ハンドラ
  onCheckboxChange: (name: string, checked: boolean) => void; // Checkbox の変更ハンドラ
  onColorChange?: (color: string) => void; // 色の変更ハンドラ
}

const ModalHabitItem: React.FC<ModalHabitItemProps> = ({
  item,
  onFormChange,
  onCheckboxChange,
  onColorChange,
}) => {
  const [isColorPickerDialogOpen, setIsColorPickerDialogOpen] = useState(false);
  if (!item) {
    // item が null の場合は何も表示しないか、ローディング表示などを出す
    return <div>読み込み中...</div>; // または null
  }

  // item.item_style がオブジェクトで、かつ color プロパティを持つか確認
  // item_style が文字列の場合は、親コンポーネント(ManagementTree)でオブジェクトにパースされている想定
  const itemStyleColor =
    item &&
    typeof item.item_style === "object" &&
    item.item_style !== null &&
    "color" in item.item_style &&
    typeof (item.item_style as { color?: unknown }).color === "string" // colorプロパティが文字列であることも確認
      ? (item.item_style as HabititemItemStyle).color
      : undefined;

  const currentColor =
    itemStyleColor || (color_def.length > 0 ? color_def[0] : "#000000"); // フォールバック色
  console.log("[ModalHabitItem] Current item:", item);
  console.log(
    "[ModalHabitItem] Determined currentColor:",
    currentColor,
    "from itemStyleColor:",
    itemStyleColor
  );

  return (
    <div className="grid gap-4 py-4">
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
      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700"
        >
          色
        </label>
        <div className="mt-1 flex items-center space-x-2">
          {/* 現在選択されている色を表示するスウォッチ */}
          <div
            className="w-8 h-8 rounded-full border border-gray-300"
            style={{ backgroundColor: currentColor }}
          ></div>
          <Input
            type="text"
            name="color"
            id="color"
            value={currentColor}
            readOnly // 直接編集はしない
            className="w-32"
          />

          {/* カラーピッカーダイアログのトリガー */}
          <Dialog
            open={isColorPickerDialogOpen}
            onOpenChange={setIsColorPickerDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-2">
                色を選択
              </Button>
            </DialogTrigger>
            {/* <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}> */}
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>色の選択</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-5 gap-2 py-4">
                {/* ここで色のグリッドをレンダリング */}
                {color_def.map((color) => (
                  <div
                    key={color}
                    className={`w-12 h-12 rounded-full cursor-pointer border-2 ${
                      currentColor === color
                        ? "border-blue-500"
                        : "border-gray-300"
                    } hover:border-blue-500 transition-all`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (onColorChange) {
                        onColorChange(color);
                      }
                      setIsColorPickerDialogOpen(false); // ダイアログを閉じる
                    }}
                    role="button"
                    aria-label={`色: ${color}`}
                  >
                    {currentColor === color && ( // 選択された色にチェックマークなどを表示
                      <svg
                        className="w-full h-full text-white p-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ModalHabitItem;
