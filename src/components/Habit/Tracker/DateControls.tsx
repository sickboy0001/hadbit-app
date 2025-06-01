"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

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
  return (
    <>
      {/* Date range selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h4 className="text-lg ">◆期間</h4> {/* text-xl から text-lg に変更 */}
        <h4 className="text-lg ">
          {/* text-xl から text-lg に変更 */}
          {format(startDate, "yyyy年M月d日", { locale: ja })} -{" "}
          {format(endDate, "yyyy年M月d日", { locale: ja })}
        </h4>
      </div>

      {/* Date range navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
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
    </>
  );
};

export default DateControls;
