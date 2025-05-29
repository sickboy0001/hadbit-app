// components/molecules/GanttChart.tsx
import React, { useEffect, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { HabitItem, HabitItemInfo } from "@/types/habit/habit_item"; // このパスをプロジェクトに合わせて調整してください
import { DbHabitLog } from "@/app/actions/habit_logs"; // このパスをプロジェクトに合わせて調整してください
import { TreeItem } from "@/types/habit/ui"; // このパスをプロジェクトに合わせて調整してください
import { generateDates } from "@/lib/datetime"; // このパスをプロジェクトに合わせて調整してください
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronRightIcon } from "lucide-react"; // アイコンをインポート

interface GanttChartProps {
  habitItems: HabitItem[];
  habitItemInfos: HabitItemInfo[];
  habitLogs: DbHabitLog[];
  treeItems: TreeItem[];
  startDate: Date;
  endDate: Date;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  expandedCategories: Record<string, boolean>; // カテゴリの開閉状態
  onToggleCategory: (categoryId: string) => void; // カテゴリ開閉トグル関数
}

const GattChartHabitTracker: React.FC<GanttChartProps> = ({
  habitItems,
  habitItemInfos = [],
  habitLogs,
  treeItems,
  startDate,
  endDate,
  onLogClick,
  expandedCategories,
  onToggleCategory,
}) => {
  const dates = generateDates(startDate, endDate);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // console.log("GattChartHabitTracker called", habitItemInfos);
  // treeItemsとhabitItemsに基づいて習慣の表示順序を決定する
  const orderedHabitDisplayItems: {
    id: string;
    name: string;
    isCategory: boolean;
    parentCategoryId?: string; // 習慣の場合の親カテゴリID
    level: number; // インデント用
  }[] = [];

  useEffect(() => {
    if (scrollContainerRef.current) {
      // スクロールコンテナが存在する場合、一番右にスクロールする
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, [dates]); // dates が変更されたとき（表示期間が変わったとき）に再実行
  // まず、トップレベルのカテゴリを追加
  treeItems.forEach((category) => {
    orderedHabitDisplayItems.push({
      id: String(category.id),
      name: category.name,
      isCategory: true,
      level: 0,
    });
    // 次に、カテゴリの子要素を追加
    // habitItems に存在する child のみを追加する（念のため）
    category.children?.forEach((child) => {
      // habitItems に存在する child のみを追加する（念のため）
      if (habitItems.some((h) => h.id === child.id)) {
        orderedHabitDisplayItems.push({
          id: String(child.id),
          name: child.name,
          isCategory: false,
          parentCategoryId: String(category.id),
          level: 1,
        });
      }
    });
  });

  // orderedHabitDisplayItemsに存在する習慣のみをフィルタリング
  const habitsToDisplay = habitItems.filter((habit) =>
    orderedHabitDisplayItems.some(
      (displayItem) => displayItem.id === habit.id.toString()
    )
  );

  // 特定の習慣と日付に対応するログを取得するヘルパー関数
  const getLogForHabitAndDate = (
    habitId: string,
    date: Date
  ): DbHabitLog | undefined => {
    // const formattedDate = format(date, "yyyy-MM-dd"); // DbHabitLog の done_at 形式に合わせる
    // ログデータから該当するものを探す
    const log = habitLogs.find(
      (habitLog) =>
        habitLog.item_id === Number(habitId) &&
        isSameDay(new Date(habitLog.done_at), date)
    );
    return log;
  };

  // Helper function to check if any child habit under a category has a log on a specific date
  // Helper function to get log details for child habits under a category on a specific date
  const getChildLogDetailsForDate = (
    categoryId: string,
    date: Date
  ): { habitName: string; comment: string | null | undefined }[] => {
    // Find all child habits of this category
    const childHabits = orderedHabitDisplayItems.filter(
      (item) => !item.isCategory && item.parentCategoryId === categoryId
    );

    // Check if any of these child habits have a log on the given date
    const logDetails: {
      habitName: string;
      comment: string | null | undefined;
    }[] = [];
    childHabits.forEach((childHabit) => {
      const log = getLogForHabitAndDate(childHabit.id, date);
      if (log) {
        logDetails.push({ habitName: childHabit.name, comment: log.comment });
      }
    });
    return logDetails;
  };

  return (
    <TooltipProvider>
      {/* ref を追加してスクロールコンテナへの参照を取得 */}
      <div className="overflow-x-auto" ref={scrollContainerRef}>
        <h2 className="text-xl font-semibold">■記録（ガントチャート）</h2>
        <table className="mt-2 min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-10 w-48" // 幅を広げました
              >
                Habit
              </th>
              {dates.map((date, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[40px]" // 日付セルに最小幅を設定
                >
                  <div className="flex flex-col items-center">
                    <span>{format(date, "M/d")}</span>
                    <span className="font-normal text-[10px]">
                      ({format(date, "EEE")})
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderedHabitDisplayItems.map((displayItem) => {
              if (displayItem.isCategory) {
                return (
                  <tr
                    key={`category-${displayItem.id}`}
                    className="bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    onClick={() => onToggleCategory(displayItem.id)}
                  >
                    <td
                      className="sticky left-0 bg-gray-100 px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 z-10"
                      style={{
                        paddingLeft: `${displayItem.level * 16 + 24}px`,
                      }} // アイコン分も考慮
                    >
                      {" "}
                      <div className="flex items-center">
                        {expandedCategories[displayItem.id] ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 mr-2" />
                        )}
                        <span className="font-bold text-base">
                          {displayItem.name}
                        </span>
                      </div>
                    </td>
                    {dates.map((date, dateIndex) => (
                      <td
                        key={`category-date-${displayItem.id}-${dateIndex}`}
                        className="px-2 py-3 whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-center" // カテゴリ行の背景色を合わせる, text-center を追加
                      >
                        {(() => {
                          const childLogDetails = getChildLogDetailsForDate(
                            displayItem.id,
                            date
                          );
                          // カテゴリ配下にログがあり、かつカテゴリが閉じている場合に◆を表示
                          if (
                            childLogDetails.length > 0 &&
                            !expandedCategories[displayItem.id]
                          ) {
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="inline-flex items-center justify-center h-5 w-5 text-blue-500 text-xs font-bold cursor-default" // cursor-default を追加
                                  >
                                    ◆
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold">
                                    {displayItem.name} ({format(date, "M/d")})
                                  </p>
                                  <ul className="list-disc pl-4 mt-1 text-sm">
                                    {childLogDetails.map((detail, index) => (
                                      <li key={index}>
                                        {detail.habitName}
                                        {detail.comment && (
                                          <span className="text-muted-foreground text-xs ml-1">
                                            ({detail.comment})
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            );
                          }
                          return null;
                        })()}
                      </td>
                    ))}
                  </tr>
                );
              } else {
                // 習慣行の場合、親カテゴリが展開されていなければ表示しない
                if (
                  displayItem.parentCategoryId &&
                  !expandedCategories[displayItem.parentCategoryId]
                ) {
                  return null;
                }
                const habit = habitsToDisplay.find(
                  (h) => h.id.toString() === displayItem.id
                );
                if (!habit) return null; // データが一貫していれば発生しないはず

                return (
                  <tr key={habit.id}>
                    <td
                      className="sticky left-0 bg-white px-6 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 z-10"
                      style={{
                        paddingLeft: `${displayItem.level * 16 + 24}px`,
                      }} // アイコンのスペース分を考慮してインデント
                    >
                      <div className="flex items-center">
                        <span>{habit.name}</span>
                      </div>
                    </td>
                    {dates.map((date, dateIndex) => {
                      const log = getLogForHabitAndDate(
                        habit.id.toString(),
                        date
                      ); // 特定のログを取得
                      const habitInfo = habitItemInfos.find(
                        (info) => info.id === habit.id
                      );
                      // console.log(habitItemInfos);
                      const markerColor = habitInfo
                        ? habitInfo.info_string
                        : "text-blue-500"; // デフォルト色

                      return (
                        <td
                          key={`habit-date-${habit.id}-${dateIndex}`}
                          className="px-2 py-3 whitespace-nowrap text-center"
                        >
                          {log && ( // ログが存在する場合のみ◆を表示
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
                                  onClick={(event) => onLogClick(log, event)} // クリック時にログデータとイベントを渡して親のハンドラーを呼び出す
                                  aria-label={`Record for ${
                                    habit.name
                                  } on ${format(date, "yyyy-MM-dd")}`}
                                  style={{
                                    borderColor: markerColor,
                                    color: markerColor,
                                  }} // hover時の色も考慮するとクラス制御が良いかも
                                >
                                  <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold cursor-default">
                                    ◆
                                  </span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-semibold">{habit.name}</p>
                                <p>
                                  {format(
                                    new Date(log.done_at),
                                    "yyyy年M月d日"
                                  )}
                                </p>
                                {log.comment && (
                                  <p className="text-sm text-muted-foreground">
                                    コメント: {log.comment}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};

export default GattChartHabitTracker;
