"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale"; // 日本語ロケールをインポート
import { DbHabitLog } from "@/app/actions/habit_logs"; // このパスをプロジェクトに合わせて調整してください
import { HabitItem, HabitItemInfo } from "@/types/habit/habit_item"; // このパスをプロジェクトに合わせて調整してください
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // shadcn/ui の Tooltip を使用
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  getBackgroundColorWithOpacity,
  getBorderColorWithOpacity,
} from "@/lib/colorUtils";
import { Skeleton } from "@/components/ui/skeleton";
interface LogSummaryDailyProps {
  habitItems: HabitItem[];
  habitLogs: DbHabitLog[];
  habitItemInfos: HabitItemInfo[];
  startDate: Date;
  endDate: Date;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

// Helper function to chunk array into smaller arrays of a specified size
// Moved outside the component to prevent re-creation on each render
const chunk = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// Helper type for processed logs with pre-parsed dates
interface ProcessedDbHabitLog extends DbHabitLog {
  _parsedDoneAtDate?: Date | null;
}

interface DailyLogItemProps {
  log: DbHabitLog;
  habitName: string;
  markerColorClass: string;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

const DailyLogItem: React.FC<DailyLogItemProps> = React.memo(
  ({ log, habitName, markerColorClass, onLogClick }) => {
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
DailyLogItem.displayName = "DailyLogItem";

const LogSummaryDailyInternal: React.FC<LogSummaryDailyProps> = (
  props: LogSummaryDailyProps
) => {
  const {
    habitItems,
    habitLogs,
    habitItemInfos = [],
    startDate,
    endDate,
    onLogClick,
  } = props;

  const componentId = useRef(
    `LogSummaryDaily-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  const prevPropsRef = useRef<LogSummaryDailyProps | null>(null);
  useEffect(() => {
    if (prevPropsRef.current) {
      Object.keys(props).forEach((key) => {
        const propKey = key as keyof LogSummaryDailyProps;
        if (
          prevPropsRef.current &&
          prevPropsRef.current[propKey] !== props[propKey]
        ) {
          console.log(
            `[${componentId}] Prop changed: ${propKey}`,
            prevPropsRef.current[propKey],
            props[propKey]
          );
        }
      });
    }
    prevPropsRef.current = props; // props は LogSummaryDailyInternal が受け取る props オブジェクト
  }); // 依存配列なしで毎レンダリング時に実行

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const dates = useMemo(() => {
    // const t0 = performance.now();
    const datesArray: Date[] = [];
    // Loop from startDate to endDate
    for (
      let dt = new Date(startDate);
      dt <= endDate;
      dt.setDate(dt.getDate() + 1)
    ) {
      datesArray.push(new Date(dt)); // Push a new Date object to avoid mutating the loop variable directly in the array
    }
    // const t1 = performance.now();
    // console.log(
    //   `[${componentId}] Calculated dates in ${t1 - t0} ms. Count: ${
    //     datesArray.length
    //   }. DisplayType: ${displayType}`
    // );
    return datesArray;
  }, [startDate, endDate]);

  // console.log("[LogSummaryDaily]habitItemInfos", habitItemInfos);
  // habitItems を ID で検索可能なマップに変換 (useMemoでキャッシュ)
  const habitItemsMap = useMemo(() => {
    // const t0 = performance.now();
    const map = new Map<number, HabitItem>();
    habitItems.forEach((item) => map.set(item.id, item));
    // const t1 = performance.now();
    // console.log(
    //   `[${componentId}] Created habitItemsMap in ${t1 - t0} ms. Item count: ${
    //     map.size
    //   }`
    // );
    return map;
  }, [habitItems]);

  // habitItemInfos を ID で検索可能なマップに変換 (useMemoでキャッシュ)
  const habitItemInfosMap = useMemo(() => {
    // const t0 = performance.now();
    const map = new Map<number, HabitItemInfo>();
    habitItemInfos.forEach((info) => map.set(info.id, info));
    // const t1 = performance.now();
    // console.log(
    //   `[${componentId}] Created habitItemInfosMap in ${
    //     t1 - t0
    //   } ms. Info count: ${map.size}`
    // );
    return map;
  }, [habitItemInfos]);

  // 日付ごとのログをまとめる
  const logsByDate = useMemo(() => {
    // const t0 = performance.now();
    const logsMap: Record<string, ProcessedDbHabitLog[]> = {}; // Use ProcessedDbHabitLog
    dates.forEach((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      logsMap[dateKey] = [];
    });

    // Pre-process logs to parse dates once
    const processedLogs: ProcessedDbHabitLog[] = habitLogs.map((log) => {
      try {
        return { ...log, _parsedDoneAtDate: parseISO(log.done_at) };
      } catch (e) {
        console.error(
          `[${componentId}] Error parsing date for log id ${log.id} during pre-processing: ${log.done_at}`,
          e
        );
        return { ...log, _parsedDoneAtDate: null }; // Handle error
      }
    });

    processedLogs.forEach((log) => {
      if (!log._parsedDoneAtDate) return; // Skip logs with invalid/unparsed dates

      const dateKey = format(log._parsedDoneAtDate, "yyyy-MM-dd");
      if (logsMap.hasOwnProperty(dateKey)) {
        logsMap[dateKey].push(log);
      }
    });

    // Sort logs for each date
    Object.keys(logsMap).forEach((dateKey) => {
      if (logsMap[dateKey].length > 0) {
        // Only sort if there are logs
        // Use pre-parsed dates for sorting
        logsMap[dateKey].sort((a, b) => {
          const timeA = a._parsedDoneAtDate?.getTime() ?? 0;
          const timeB = b._parsedDoneAtDate?.getTime() ?? 0;
          return timeA - timeB;
        });
      }
    });

    // const t1 = performance.now();
    // console.log(
    //   `[${componentId}] Calculated logsByDate (optimized approach) in ${
    //     t1 - t0
    //   } ms. Number of log entries processed: ${
    //     habitLogs.length
    //   }. Number of dates in view: ${dates.length}`
    // );
    return logsMap;
  }, [dates, habitLogs, componentId]);

  // item_idから習慣名を取得するヘルパー関数
  const getHabitNameById = useMemo(() => {
    return (itemId: number): string => {
      const habit = habitItemsMap.get(itemId); // マップから取得
      return habit ? habit.name : `Unknown Habit (ID: ${itemId})`;
    };
  }, [habitItemsMap]);

  useEffect(() => {
    // Tailwind CSSの 'sm' ブレークポイント (640px) に基づいて画面サイズを判定
    // 'sm' 未満 (max-width: 639.98px) の場合に isSmallScreen を true にする
    const mediaQuery = window.matchMedia("(max-width: 639.98px)");

    const handleScreenChange = (
      event: MediaQueryListEvent | MediaQueryList
    ) => {
      setIsSmallScreen(event.matches);
    };

    // 初期状態を設定
    handleScreenChange(mediaQuery);

    // リスナーを追加
    // addEventListener が使える場合はそちらを優先
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleScreenChange);
    } else {
      mediaQuery.addListener(handleScreenChange); // 古いブラウザ向けのフォールバック
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleScreenChange);
      } else {
        mediaQuery.removeListener(handleScreenChange); // 古いブラウザ向けのフォールバック
      }
    };
  }, []);

  // 画面サイズに応じてグループ化する日数を決定
  const groupedDates = useMemo(() => {
    const groupSize = isSmallScreen ? 3 : 7;
    const result = chunk(dates, groupSize);

    return result;
  }, [dates, isSmallScreen]); // chunkも依存配列に追加

  // データが空の場合のスケルトン表示
  if (habitItems.length === 0 || habitLogs.length === 0) {
    return (
      <div className="p-4">
        {habitItems.length === 0 && (
          <p className="text-sm text-muted-foreground mb-2">
            表示する習慣項目がありません。
          </p>
        )}
        {habitLogs.length === 0 && habitItems.length > 0 && (
          <p className="text-sm text-muted-foreground mb-2">
            表示するログが期間内にありません。
          </p>
        )}
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  return (
    <TooltipProvider>
      {/* Wrap with a single TooltipProvider */}
      <div className="overflow-x-auto">
        <div className="flex flex-col">
          {/* Container for weekly rows */}

          {groupedDates.map((dayGroup, groupIndex) => {
            // console.log(
            //   `[${componentId}] Rendering dayGroup index: ${groupIndex}, number of days in group: ${dayGroup.length}`
            // );
            return (
              <div
                key={groupIndex}
                className="flex flex-row flex-wrap" // Each row represents a week. Added bottom margin for spacing.
              >
                {dayGroup.map((date) => {
                  // Iterate over days in the current week
                  const dateKey = format(date, "yyyy-MM-dd");
                  const logsForThisDate = logsByDate[dateKey] || [];

                  return (
                    <div
                      key={dateKey} // Use a stable key like dateKey
                      className="flex-shrink-0 w-1/3 sm:w-1/7 border border-gray-200 p-1" // Each day column
                    >
                      <div className="text-center font-semibold text-gray-700 mb-1">
                        <span
                          className={
                            date.getDay() === 0
                              ? "text-red-600"
                              : date.getDay() === 6
                              ? "text-blue-600"
                              : ""
                          }
                        >
                          {format(date, "M/d(EEE)", { locale: ja })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {logsForThisDate.length > 0 ? (
                          logsForThisDate.map((log) => {
                            const habitInfo = habitItemInfosMap.get(
                              // マップから取得
                              log.item_id
                            );
                            const markerColorClass = habitInfo
                              ? habitInfo.info_string
                              : "#3B82F6"; // Default to a HEX color (e.g., blue-500)

                            return (
                              <DailyLogItem
                                key={log.id}
                                log={log}
                                habitName={getHabitNameById(log.item_id)}
                                markerColorClass={markerColorClass}
                                onLogClick={onLogClick}
                              />
                            );
                          })
                        ) : (
                          <p className="text-center text-gray-400 text-sm py-1">
                            ログなし
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
const LogSummaryDaily = React.memo(LogSummaryDailyInternal);
LogSummaryDaily.displayName = "LogSummaryDaily";
export default LogSummaryDaily;
