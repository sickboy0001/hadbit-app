"use client";

import React, { useMemo, useRef } from "react";
import {
  format,
  parseISO,
  addDays,
  isWithinInterval, // ログが特定の週の期間内にあるか判定するために使用
} from "date-fns";
import { ja } from "date-fns/locale"; // 日本語ロケールをインポート
import { DbHabitLog } from "@/app/actions/habit_logs";
import { HabitItem, HabitItemInfo } from "@/types/habit/habit_item";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  getBackgroundColorWithOpacity,
  getBorderColorWithOpacity,
} from "@/lib/colorUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface LogSummaryColumnarWeeksProps {
  habitItems: HabitItem[];
  habitLogs: DbHabitLog[];
  habitItemInfos: HabitItemInfo[];
  startDate: Date; // 週の開始日として使用
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

interface ProcessedDbHabitLog extends DbHabitLog {
  _parsedDoneAtDate?: Date | null;
}

// DailyLogItemは、週の表示に合わせて日付も表示するように修正
interface WeeklyLogItemProps {
  log: DbHabitLog;
  habitName: string;
  markerColorClass: string;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  displayDate: Date; // 表示する日付を追加
}

const WeeklyLogItem: React.FC<WeeklyLogItemProps> = React.memo(
  ({ log, habitName, markerColorClass, onLogClick, displayDate }) => {
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
                  displayDate.getDay() === 0
                    ? "text-red-600"
                    : displayDate.getDay() === 6
                    ? "text-blue-600"
                    : ""
                }
              >
                {format(displayDate, "M/d(EEE)", { locale: ja })}
              </span>{" "}
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
            {format(parseISO(log.done_at), "yyyy年M月d日 HH:mm", {
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
WeeklyLogItem.displayName = "WeeklyLogItem";

const LogSummaryWeeksInternal: React.FC<LogSummaryColumnarWeeksProps> = (
  props: LogSummaryColumnarWeeksProps
) => {
  const {
    habitItems,
    habitLogs,
    habitItemInfos = [],
    startDate,
    onLogClick,
  } = props;

  const componentId = useRef(
    `LogSummaryColumnarWeeks-${Math.random().toString(36).substr(2, 9)}`
  ).current;
  console.log("LogSummaryColumnarWeeks rendered (Week direct log view)");

  // 週の定義: startOfWeekから21日間を3つの週に分割
  // 修正: startDateから厳密に3週間を表示

  const weekRanges = useMemo(() => {
    // const startOfFirstWeek = startOfWeek(startDate, { weekStartsOn: 1 }); // 月曜日を週の開始とする
    const ranges: { start: Date; end: Date }[] = [];
    for (let i = 0; i < 3; i++) {
      const weekStart = addDays(startDate, i * 7); // startDate を直接基準にする
      const weekEnd = addDays(weekStart, 6);

      ranges.push({ start: weekStart, end: weekEnd });
    }
    return ranges;
  }, [startDate]);

  // habitItems を ID で検索可能なマップに変換
  const habitItemsMap = useMemo(() => {
    const map = new Map<number, HabitItem>();
    habitItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [habitItems]);

  // habitItemInfos を ID で検索可能なマップに変換
  const habitItemInfosMap = useMemo(() => {
    const map = new Map<number, HabitItemInfo>();
    habitItemInfos.forEach((info) => map.set(info.id, info));
    return map;
  }, [habitItemInfos]);

  // 全てのログを事前処理して、パース済み日付とソートを行う
  const processedHabitLogs = useMemo(() => {
    const processed = habitLogs.map((log) => {
      try {
        return { ...log, _parsedDoneAtDate: parseISO(log.done_at) };
      } catch (e) {
        console.error(
          `[${componentId}] Error parsing date for log id ${log.id}: ${log.done_at}`,
          e
        );
        return { ...log, _parsedDoneAtDate: null };
      }
    });
    // 全てのログを日付順にソート（必要に応じて）
    processed.sort((a, b) => {
      const timeA = a._parsedDoneAtDate?.getTime() ?? 0;
      const timeB = b._parsedDoneAtDate?.getTime() ?? 0;
      return timeA - timeB;
    });
    return processed;
  }, [habitLogs, componentId]);

  // 週ごとのログをまとめる
  const logsByWeek = useMemo(() => {
    const weekLogs: Record<number, ProcessedDbHabitLog[]> = {};
    weekRanges.forEach((_, index) => (weekLogs[index] = [])); // 各週を初期化

    processedHabitLogs.forEach((log) => {
      if (!log._parsedDoneAtDate) return;

      weekRanges.forEach((range, index) => {
        if (
          isWithinInterval(log._parsedDoneAtDate!, {
            start: range.start,
            end: range.end,
          })
        ) {
          weekLogs[index].push(log);
        }
      });
    });

    // 週内のログは日付順にソート済みなので、ここでは不要
    return weekLogs;
  }, [processedHabitLogs, weekRanges]);

  // item_idから習慣名を取得するヘルパー関数
  const getHabitNameById = useMemo(() => {
    return (itemId: number): string => {
      const habit = habitItemsMap.get(itemId);
      return habit ? habit.name : `Unknown Habit (ID: ${itemId})`;
    };
  }, [habitItemsMap]);

  // データが空の場合のスケルトン表示
  if (habitItems.length === 0) {
    // habitLogsが空でも、期間中にログがなければ表示する
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-2">
          表示する習慣項目がありません。
        </p>
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto p-4">
        {/*
          gridレイアウトを使用して列数を制御します。
          デフォルトは1列、sm (640px) 以上で2列、lg (1024px) 以上で3列とします。
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekRanges.map((weekRangeData, weekIndex) => {
            // groupedWeeksはdatesから週範囲を生成
            const weekRange = weekRanges[weekIndex]; // 週の期間情報を取得

            const logsInThisWeek = logsByWeek[weekIndex] || [];

            return (
              <div
                key={weekIndex}
                className="border border-gray-300 rounded-lg p-3 shadow-md bg-white"
                style={{ minWidth: "300px" }}
              >
                <h3 className="text-center font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  {weekIndex + 1}週目 (
                  {format(weekRange.start, "M/d", { locale: ja })}〜
                  {format(weekRange.end, "M/d", { locale: ja })})
                </h3>
                {/* ログを2列で直接表示 */}
                <div className="grid grid-cols-2 gap-1.5">
                  {logsInThisWeek.length > 0 ? (
                    logsInThisWeek.map((log) => {
                      const habitInfo = habitItemInfosMap.get(log.item_id);
                      const markerColorClass = habitInfo
                        ? habitInfo.info_string
                        : "#3B82F6";

                      return (
                        <WeeklyLogItem
                          key={log.id}
                          log={log}
                          habitName={getHabitNameById(log.item_id)}
                          markerColorClass={markerColorClass}
                          onLogClick={onLogClick}
                          displayDate={log._parsedDoneAtDate!} // パース済みのDateオブジェクトを渡す
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center text-gray-400 text-sm py-1">
                      ログなし
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

const LogSummaryWeeks = React.memo(LogSummaryWeeksInternal);
LogSummaryWeeks.displayName = "LogSummaryWeeks";
export default LogSummaryWeeks;
