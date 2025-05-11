"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { format, addDays, subDays, isEqual } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner"; // sonner から toast をインポート
import PresetButtonsSection from "./PresetButtonsSection";
import DateControls from "./DateControls";
import HabitDisplayTable from "./HabitDisplayTable";
// import { findHabitById, getParentName } from "@/lib/habit";
// import { createSampleData, PRESET_HABIT_BUTTONS } from "./dummy";
import { Habit, TreeItem } from "@/types/habit/ui";
import { HabitItem } from "@/types/habit/habit_item";
import { useAuth } from "@/contexts/AuthContext";
import {
  readHabitItems,
  readHabitItemTreeWithUserId,
} from "@/app/actions/habit_items";
import { buildTreeFromHabitAndParentReration } from "@/util/treeConverter";

export type PresetDisplayItem =
  | { type: "button"; id: string; name: string; originalName: string }
  | {
      type: "category";
      id: string;
      name: string;
      children: PresetDisplayItem[];
    };

export type NestedGroupedButtons = Record<string, PresetDisplayItem[]>;

const DAY_DEF = 20;

export default function HabitTracker() {
  // const { toast } = useToast();
  const [, startTransition] = useTransition(); // ★ トランジションフック
  const [, setHabitItems] = useState<HabitItem[]>([]);
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]); // ★ 初期値を空配列に変更
  const { user, loading: authLoading } = useAuth(); // ★ 認証状態を取得

  const [habits, setHabits] = useState<Habit[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({}); // 初期値を空オブジェクトに変更

  // Default date range: Today and 13 days after (14 days total)
  const today = new Date();
  const defaultEndDate = new Date();
  const defaultStartDate = addDays(today, -DAY_DEF);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const refreshItems = useCallback(() => {
    if (!user?.userid) return; // ユーザーIDがない場合は何もしない
    if (user === undefined) return; // ユーザーIDがない場合は何もしない
    const userId = user.userid;
    startTransition(async () => {
      try {
        const nowHabitItems = await readHabitItems(userId);
        const nowHabitItemTree = await readHabitItemTreeWithUserId(userId);
        setHabitItems(nowHabitItems);

        const nowTreeItems = buildTreeFromHabitAndParentReration(
          nowHabitItems,
          nowHabitItemTree
        );
        console.log("nowTreeItems", nowTreeItems);
        setTreeItems(nowTreeItems);
      } catch (error) {
        toast.error("リストの読み込みに失敗しました。");
        console.error("Failed to fetch habit items:", error);
      }
    });
  }, [user]); // user.userid が変わったら再生成

  // treeItems から Habit[] を生成する再帰関数
  const createHabitsFromTreeItemsRecursive = useCallback(
    (items: TreeItem[], parentId?: string, level: number = 0): Habit[] => {
      return items.map((item) => {
        const habit: Habit = {
          id: String(item.id), // IDを文字列に変換
          name: item.name,
          parentId: parentId,
          completedDates: [], // 実績は空で初期化
          level: level,
        };
        if (item.children && item.children.length > 0) {
          habit.children = createHabitsFromTreeItemsRecursive(
            // 再帰呼び出しなので、useCallback内で自分自身を呼ぶのはOK
            item.children,
            String(item.id),
            level + 1
          );
        }
        return habit;
      });
    },
    [] // この関数自体は外部のstateやpropsに依存していないため、依存配列は空
  );

  useEffect(() => {
    if (user?.userid) {
      refreshItems();
    }
  }, [user?.userid, refreshItems]); // refreshItems も依存配列に追加

  useEffect(() => {
    if (treeItems.length > 0) {
      const newHabits = createHabitsFromTreeItemsRecursive(treeItems);
      setHabits(newHabits);

      // expandedCategories も treeItems ベースで初期化する (デフォルトで全て展開)
      const initialExpanded: Record<string, boolean> = {};
      const setInitialExpandedRecursively = (items: TreeItem[]) => {
        items.forEach((item) => {
          if (item.children && item.children.length > 0) {
            initialExpanded[String(item.id)] = true; // デフォルトで展開
            setInitialExpandedRecursively(item.children);
          }
        });
      };
      setInitialExpandedRecursively(treeItems);
      setExpandedCategories(initialExpanded);
    }
  }, [treeItems, createHabitsFromTreeItemsRecursive]);

  // Generate dates for the specified range
  const generateDates = () => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    return dates;
  };

  const dates = generateDates();

  // Navigate to previous date range
  const goToPreviousRange = () => {
    const daysInRange = dates.length;
    setStartDate(subDays(startDate, daysInRange));
    setEndDate(subDays(endDate, daysInRange));
  };

  // Navigate to next date range
  const goToNextRange = () => {
    const daysInRange = dates.length;
    setStartDate(addDays(startDate, daysInRange));
    setEndDate(addDays(endDate, daysInRange));
  };

  // Handle start date change
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;

    setStartDate(date);
    setEndDate(addDays(date, DAY_DEF));
  };

  // Handle end date change
  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;

    setEndDate(date);
    setStartDate(subDays(date, DAY_DEF));
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Get all completed leaf habits for a parent on a specific date
  const getCompletedLeafHabits = (habit: Habit, date: Date): Habit[] => {
    const completedHabits: Habit[] = [];

    const traverse = (h: Habit) => {
      if (!h.children || h.children.length === 0) {
        if (isCompleted(h, date)) {
          completedHabits.push(h);
        }
      } else {
        h.children.forEach(traverse);
      }
    };

    traverse(habit);
    return completedHabits;
  };

  // Toggle habit completion for a date
  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const updateHabits = (habits: Habit[]): Habit[] => {
      return habits.map((habit) => {
        if (habit.id === habitId && habit.completedDates) {
          const dateToCheck = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          const isAlreadyCompleted = habit.completedDates.some(
            (completedDate) =>
              isEqual(
                new Date(
                  completedDate.getFullYear(),
                  completedDate.getMonth(),
                  completedDate.getDate()
                ),
                dateToCheck
              )
          );

          const updatedDates = isAlreadyCompleted
            ? habit.completedDates.filter(
                (completedDate) =>
                  !isEqual(
                    new Date(
                      completedDate.getFullYear(),
                      completedDate.getMonth(),
                      completedDate.getDate()
                    ),
                    dateToCheck
                  )
              )
            : [...habit.completedDates, new Date(dateToCheck)];

          return { ...habit, completedDates: updatedDates };
        }

        if (habit.children) {
          return { ...habit, children: updateHabits(habit.children) };
        }

        return habit;
      });
    };

    setHabits(updateHabits(habits));
  };

  // Toggle habit for today
  const toggleHabitForToday = (habitId: string, habitName: string) => {
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // findHabitById をローカルで定義 (またはインポート元を変更)
    const findHabitById = (
      habitsToSearch: Habit[],
      id: string
    ): Habit | undefined => {
      for (const habit of habitsToSearch) {
        if (habit.id === id) return habit;
        if (habit.children) {
          const foundInChildren = findHabitById(habit.children, id);
          if (foundInChildren) return foundInChildren;
        }
      }
      return undefined;
    };
    // Find the habit
    const habit = findHabitById(habits, habitId);
    if (!habit || !habit.completedDates) return;

    // Check if already completed
    const isAlreadyCompleted = habit.completedDates.some(
      (completedDate: Date) =>
        isEqual(
          new Date(
            completedDate.getFullYear(),
            completedDate.getMonth(),
            completedDate.getDate()
          ),
          todayDate
        )
    );
    if (isAlreadyCompleted) {
      // 既に記録されている場合は、その旨を通知
      toast.info(`${habitName}は既に記録済みです`, {
        description: `${format(today, "yyyy年M月d日", { locale: ja })}`,
      });
    } else {
      // まだ記録されていない場合は、記録を実行
      toggleHabitCompletion(habitId, today);
      toast.success(`${habitName}を記録しました`, {
        description: `${format(today, "yyyy年M月d日", { locale: ja })}`,
      });
    }
  };

  // Get month label for a date
  const getMonthLabel = (date: Date) => {
    return format(date, "M月", { locale: ja });
  };

  // Check if date is the first of the month
  const isFirstOfMonth = (date: Date) => {
    return date.getDate() === 1;
  };

  // Helper function to convert TreeItem[] to PresetDisplayItem[] for PresetButtonsSection
  const mapTreeItemsToPresetDisplayItems = (
    items: TreeItem[]
  ): PresetDisplayItem[] => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      if (hasChildren) {
        return {
          type: "category",
          id: String(item.id),
          name: item.name,
          children: mapTreeItemsToPresetDisplayItems(item.children!), // Recursive call
        };
      } else {
        return {
          type: "button",
          id: String(item.id),
          name: item.name,
          originalName: item.name,
        };
      }
    });
  };

  // Group preset buttons using treeItems
  const groupedButtons = treeItems.reduce<NestedGroupedButtons>(
    (acc, topLevelItem) => {
      // topLevelItem.id is the key for the group (e.g., "1" for "運動")
      // topLevelItem.children are the items within that group (e.g., "ジム", "散歩")
      // These children can be buttons or sub-categories
      acc[String(topLevelItem.id)] = mapTreeItemsToPresetDisplayItems(
        topLevelItem.children || []
      );
      return acc;
    },
    {}
  );

  // Get parent name from treeItems for PresetButtonsSection card titles
  const getParentNameFromTree = (parentId: string): string => {
    const parentIdNum = parseInt(parentId, 10);
    // treeItems はトップレベルのアイテムの配列なので、IDが一致するものを探す
    const foundItem = treeItems.find((item) => item.id === parentIdNum);
    return foundItem?.name || "カテゴリ不明";
  };

  const isCompleted = (habit: Habit, date: Date): boolean => {
    if (!habit.completedDates || habit.completedDates.length === 0) {
      return false;
    }
    const targetDateNormalized = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    return habit.completedDates.some((completedDate) => {
      const completedDateNormalized = new Date(
        completedDate.getFullYear(),
        completedDate.getMonth(),
        completedDate.getDate()
      );
      return isEqual(completedDateNormalized, targetDateNormalized);
    });
  };

  if (
    authLoading ||
    (user?.userid && treeItems.length === 0 && habits.length === 0)
  ) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }
  return (
    <div className="space-y-6">
      <PresetButtonsSection
        groupedButtons={groupedButtons}
        onToggleHabit={toggleHabitForToday}
        getParentName={getParentNameFromTree} // 更新されたゲッター関数を使用
      />

      <DateControls
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onGoToPreviousRange={goToPreviousRange}
        onGoToNextRange={goToNextRange}
      />

      <HabitDisplayTable
        habits={habits} // treeItemsから生成されたhabitsを使用
        dates={dates}
        expandedCategories={expandedCategories}
        onToggleCategory={toggleCategory}
        onToggleHabitCompletion={toggleHabitCompletion}
        isCompleted={isCompleted}
        getCompletedLeafHabits={getCompletedLeafHabits}
        getMonthLabel={getMonthLabel}
        isFirstOfMonth={isFirstOfMonth}
      />
    </div>
  );
}
