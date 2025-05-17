"use client";
import * as React from "react"; // Reactをインポート
import { format, isValid } from "date-fns"; // isValid をインポート
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  // Popoverの開閉状態を管理するためのstate
  const [isOpen, setIsOpen] = React.useState(false);
  // 日付が選択されたときの処理
  const handleDateSelect = (selectedDay: Date | undefined) => {
    console.log("[DatePicker] handleDateSelect called with:", selectedDay);
    console.log("[DatePicker] typeof setDate prop:", typeof setDate);

    setDate(selectedDay); // 親コンポーネントに選択された日付を通知

    setIsOpen(false); // 日付を選択したらPopoverを閉じる
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      {/* ★ modal={false} を追加 */}
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal", // 幅を少し広めに調整
            !date && "text-muted-foreground" // 日付が選択されていない場合は文字色を薄くする
          )}
          aria-label={
            date && isValid(date)
              ? `選択中の日付: ${format(date, "yyyy年M月d日", { locale: ja })}`
              : "日付を選択"
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date && isValid(date) ? ( // dateが存在し、かつ有効な日付であることを確認
            format(date, "yyyy年M月d日", { locale: ja })
          ) : (
            <span>日付を選択してください</span> // プレースホルダーテキストを少し変更
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onOpenAutoFocus={(e) => {
          // Popoverが開いたときの自動フォーカスをキャンセルしてみる
          e.preventDefault(); // これでCalendarのinitialFocusが効くか、あるいは手動でフォーカスを当てる
          // console.log("[DatePicker] PopoverContent onOpenAutoFocus");
        }}
        // onPointerDownOutside={(e) => {}}
      >
        {/* Calendarをdivで囲み、refを設定 */}
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect} // 日付選択時のコールバックを修正
          initialFocus // Popoverが開いたときにカレンダーにフォーカス
          locale={ja} // 日本語ロケールを設定
        />
      </PopoverContent>
    </Popover>
  );
}
