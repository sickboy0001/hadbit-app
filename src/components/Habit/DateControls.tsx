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
        <div className="flex items-center gap-2">
          <span>開始日:</span>
          <DatePicker date={startDate} setDate={onStartDateChange} />
        </div>
        <div className="flex items-center gap-2">
          <span>終了日:</span>
          <DatePicker date={endDate} setDate={onEndDateChange} />
        </div>
      </div>

      {/* Date range navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(startDate, "yyyy年M月d日", { locale: ja })} -{" "}
          {format(endDate, "yyyy年M月d日", { locale: ja })}
        </h2>
        <div className="flex gap-2">
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
