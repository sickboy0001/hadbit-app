"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale"; // 日本語ロケールをインポート
import { DbHabitLog } from "@/app/actions/habit_logs"; // このパスをプロジェクトに合わせて調整してください
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // shadcn/ui の Tooltip を使用
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  icons as lucideIcons,
  LucideIcon,
  HelpCircle,
  ImageIcon,
} from "lucide-react"; // アイコン関連をインポート
import {
  getBackgroundColorWithOpacity,
  getBorderColorWithOpacity,
} from "@/lib/colorUtils";

// --- Icon Helper ---
const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return ImageIcon; // アイコン名がなければデフォルトアイコン
  const Icon = lucideIcons[iconName as keyof typeof lucideIcons];
  return Icon || HelpCircle; // 見つからなければヘルプアイコン
};

interface LogSummaryDailyLogProps {
  log: DbHabitLog;
  habitName: string;
  color: string;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  iconName: string;
}

const LogSummaryDailyLog: React.FC<LogSummaryDailyLogProps> = React.memo(
  ({ log, habitName, color: markerColorClass, onLogClick, iconName }) => {
    // console.log(`Rendering DailyLogItem: ${habitName} - ${log.id}`); // For debugging re-renders
    return (
      <TooltipPrimitive.Root>
        {/* Use Radix UI Root directly */}
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
                <span className="text-gray-700 text-[0.7rem] italic ml-1 min-w-0">
                  {/* min-w-0 を追加してコメントが縮小できるようにする */}(
                  {log.comment})
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
LogSummaryDailyLog.displayName = "LogSummaryDailyLog";
export default LogSummaryDailyLog;
