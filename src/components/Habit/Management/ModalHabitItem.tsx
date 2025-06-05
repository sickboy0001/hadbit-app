import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Checkbox を Switch に変更
import { HabitItem, HabititemItemStyle } from "@/types/habit/habit_item";
import { color_def, iconSampleArray } from "@/constants/habitStyle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Collapsible をインポート
import {
  ChevronDown,
  ChevronRightIcon,
  icons as lucideIcons, // lucide-react の全アイコンをインポート
  LucideIcon, // 型として使用
  HelpCircle, // iconSampleArray の名前が無効な場合のフォールバック
  ImageIcon, // item_style.icon が未設定の場合のプレースホルダー
} from "lucide-react";
import { cn } from "@/lib/utils"; // cn をインポート

interface ModalHabitItemProps {
  item: Partial<HabitItem> | null; // 編集中のデータ
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void; // Input/Textarea の変更ハンドラ
  onCheckboxChange: (name: string, checked: boolean) => void; // Checkbox の変更ハンドラ
  onColorChange?: (color: string) => void; // 色の変更ハンドラ
  onIconChange?: (iconName: string) => void; // アイコンの変更ハンドラ
}

const ModalHabitItem: React.FC<ModalHabitItemProps> = ({
  item,
  onFormChange,
  onCheckboxChange,
  onColorChange,
  onIconChange,
}) => {
  const [isColorSectionOpen, setIsColorSectionOpen] = useState(false); // 色選択セクションの開閉状態
  const [isIconSectionOpen, setIsIconSectionOpen] = useState(false); // アイコン選択セクションの開閉状態

  // --- Icon Definitions ---
  interface IconDefinition {
    name: string;
    component: LucideIcon;
  }

  const icon_definitions: IconDefinition[] = iconSampleArray
    .map((name) => {
      const IconComponent = lucideIcons[name as keyof typeof lucideIcons];
      return {
        name,
        component: IconComponent || HelpCircle, // 名前が無効ならHelpCircle
      };
    })
    .filter(
      (iconDef) =>
        iconDef.component !== HelpCircle ||
        iconSampleArray.includes("HelpCircle")
    ); // HelpCircleが意図的なら残す

  const itemStyleIconName =
    item &&
    typeof item.item_style === "object" &&
    item.item_style !== null &&
    "icon" in item.item_style &&
    typeof (item.item_style as { icon?: unknown }).icon === "string"
      ? (item.item_style as { icon: string }).icon
      : undefined;

  const getIconComponent = (name?: string): LucideIcon => {
    const iconDef = icon_definitions.find((icon) => icon.name === name);
    return iconDef ? iconDef.component : ImageIcon; // item_style.icon がない場合は ImageIcon
  };

  const CurrentIconComponent = getIconComponent(itemStyleIconName);
  console.log(
    "[ModalHabitItem] Determined currentIconName:",
    itemStyleIconName
  );

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
      <div className="mt-1 flex items-center space-x-2">
        {/* 色選択セクションをCollapsibleでラップ */}
        <Collapsible
          open={isColorSectionOpen}
          onOpenChange={setIsColorSectionOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                "flex items-center cursor-pointer select-none rounded-md hover:bg-accent/50 transition-colors p-2 -m-2" // クリックしやすいようにパディングとネガティブマージンを追加
              )}
            >
              <label
                htmlFor="color"
                className="text-sm font-medium text-gray-700 cursor-pointer" // ラベルもクリック可能に
              >
                色
              </label>

              {/* 現在選択されている色を表示するスウォッチ */}
              <div
                className="w-6 h-6 rounded-full border border-gray-300 ml-4" // マージン調整
                style={{ backgroundColor: currentColor }}
              ></div>

              {isColorSectionOpen ? (
                <ChevronDown className="h-4 w-4 mr-2 ml-auto" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 mr-2 ml-auto" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {/* 色のグリッド */}
            <div className="grid grid-cols-8 gap-2 py-2">
              {color_def.map((color) => (
                <div
                  key={color}
                  className={`w-10 h-10 rounded-full cursor-pointer border-2 ${
                    currentColor === color
                      ? "border-blue-500"
                      : "border-gray-300"
                  } hover:border-blue-500 transition-all flex items-center justify-center`} // 中央寄せを追加
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    if (onColorChange) {
                      onColorChange(color);
                      setIsColorSectionOpen(false);
                    }
                    // setIsColorSectionOpen(false); // 色選択後に閉じる場合はコメント解除
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
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="mt-1 flex items-center space-x-2">
        {/* --- アイコン選択セクション --- */}
        <Collapsible
          open={isIconSectionOpen}
          onOpenChange={setIsIconSectionOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                "flex items-center cursor-pointer select-none rounded-md hover:bg-accent/50 transition-colors p-2 -m-2"
              )}
            >
              <label
                htmlFor="icon"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                アイコン
              </label>
              <div className="w-6 h-6 flex items-center justify-center ml-4">
                <CurrentIconComponent className="w-5 h-5 text-gray-700" />
              </div>
              {isIconSectionOpen ? (
                <ChevronDown className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 ml-auto" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="grid grid-cols-8 gap-2 py-2">
              {icon_definitions.map(({ name, component: IconComp }) => (
                <div
                  key={name}
                  className={cn(
                    "w-10 h-10 rounded-lg cursor-pointer border-2 flex items-center justify-center hover:border-blue-500 transition-all",
                    itemStyleIconName === name
                      ? "border-blue-500 bg-blue-100/50"
                      : "border-gray-300"
                  )}
                  onClick={() => {
                    if (onIconChange) {
                      onIconChange(name);
                      setIsIconSectionOpen(false);
                    }
                    // setIsIconSectionOpen(false); // Optionally close after selection
                  }}
                  role="button"
                  aria-label={`アイコン: ${name}`}
                  title={name}
                >
                  <IconComp className="w-5 h-5 text-gray-700" />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>{" "}
      </div>
    </div>
  );
};

export default ModalHabitItem;
