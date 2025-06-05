"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Collapsible関連をインポート

interface DateControlsProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onGoToPreviousRange: () => void;
  onGoToNextRange: () => void;
}

const DateControls: React.FC<DateControlsProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onGoToPreviousRange,
  onGoToNextRange,
}) => {
  const [isDateSettingsOpen, setIsDateSettingsOpen] = useState(() => {
    // クライアントサイドでのみ window オブジェクトを参照
    if (typeof window !== "undefined") {
      // Tailwind CSS の 'sm' ブレークポイント (640px) 未満を「小さい画面」とする
      const isSmallScreen = window.matchMedia("(max-width: 639.98px)").matches;
      return !isSmallScreen; // 小さい画面なら false (閉じる), 通常なら true (開く)
    }
    return false; // デフォルトまたはサーバーサイドレンダリング時は閉じておく
  });
  return (
    <>
      <Collapsible
        open={isDateSettingsOpen}
        onOpenChange={setIsDateSettingsOpen}
      >
        <div className="flex items-center justify-between">
          {/* 期間表示 */}
          <div className="flex items-center gap-2">
            <h4 className="text-lg">◆期間</h4>
            <span className="text-sm text-gray-700">
              {format(startDate, "yyyy年M月d日", { locale: ja })} -{" "}
              {format(endDate, "yyyy年M月d日", { locale: ja })}
            </span>
          </div>
          {/* 折りたたみトリガーボタン */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <Settings2 className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">期間設定</span>
              <ChevronDown
                className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                  isDateSettingsOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          {/* Date range navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mt-2 border-t pt-2">
            <div className="flex flex-col sm:flex-row justify-items-start gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span>開始日:</span>
                <DatePicker
                  date={startDate}
                  setDate={onStartDateChange}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span>終了日:</span>
                <DatePicker
                  date={endDate}
                  setDate={onEndDateChange}
                  className="w-40"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
              <Button variant="outline" size="sm" onClick={onGoToPreviousRange}>
                <ChevronLeft className="h-4 w-4 mr-1" /> 前の期間
              </Button>
              <Button variant="outline" size="sm" onClick={onGoToNextRange}>
                次の期間 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

export default DateControls;
