"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale"; // 日本語ロケールをインポート
import { DbHabitLog } from "@/app/actions/habit_logs";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  getBackgroundColorWithOpacity,
  getBorderColorWithOpacity,
} from "@/lib/colorUtils";
import {
  icons as lucideIcons,
  LucideIcon,
  HelpCircle,
  ImageIcon,
} from "lucide-react"; // アイコン関連をインポート

// --- Icon Helper ---
const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return ImageIcon; // アイコン名がなければデフォルトアイコン
  const Icon = lucideIcons[iconName as keyof typeof lucideIcons];
  return Icon || HelpCircle; // 見つからなければヘルプアイコン
};

// DailyLogItemは、週の表示に合わせて日付も表示するように修正
interface LogSummaryWeekslogProps {
  log: DbHabitLog;
  habitName: string;
  markerColorClass: string;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  displayDate: Date; // 表示する日付を追加
  iconName: string;
}

const LogSummaryWeekslog: React.FC<LogSummaryWeekslogProps> = React.memo(
  ({ log, habitName, markerColorClass, onLogClick, displayDate, iconName }) => {
    return (
      <TooltipPrimitive.Root>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="w-full text-left p-1 rounded-md hover:bg-gray-200 text-xs flex justify-between items-center border"
            style={{
              borderColor: getBorderColorWithOpacity(markerColorClass),
              backgroundColor: getBackgroundColorWithOpacity(markerColorClass),
            }}
            onClick={(event) => onLogClick(log, event)}
          >
            <div className="flex items-center">
              {/* 日付を表示 */}
              <span
                className={
                  (displayDate.getDay() === 0
                    ? "text-red-600"
                    : displayDate.getDay() === 6
                    ? "text-blue-600"
                    : "text-gray-700") + // 通常の日の色を追加
                  " mr-1"
                }
              >
                {format(displayDate, "M/d(EEE)", { locale: ja })}
              </span>
              {iconName && // iconName があればアイコンを表示
                React.createElement(getIconComponent(iconName), {
                  className: "h-4 w-4 mr-1",
                  style: { color: markerColorClass },
                })}
              <span
                className="font-semibold"
                style={{ color: markerColorClass }}
              >
                {habitName}
              </span>
              {log.comment && (
                <span className="text-gray-700 text-[0.7rem] italic ml-1">
                  ({log.comment})
                </span>
              )}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{habitName}</p>
          <p>
            {format(parseISO(log.done_at), "yyyy年M月d日", {
              locale: ja,
            })}
          </p>
          {log.comment && (
            <p className="text-sm text-muted-foreground">
              コメント: {log.comment}
            </p>
          )}
        </TooltipContent>
      </TooltipPrimitive.Root>
    );
  }
);
// Add displayName to the component
LogSummaryWeekslog.displayName = "LogSummaryWeekslog";
export default LogSummaryWeekslog;
