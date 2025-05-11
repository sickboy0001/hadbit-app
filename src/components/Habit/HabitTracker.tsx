"use client";

import { useState } from "react";
import { format, addDays, subDays, isEqual } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner"; // sonner から toast をインポート
import { findHabitById, getParentName } from "./utils/habitUtils"; // ユーティリティをインポート
import PresetButtonsSection from "./PresetButtonsSection";
import DateControls from "./DateControls";
import HabitDisplayTable from "./HabitDisplayTable";
import {
  createSampleData,
  PRESET_HABIT_BUTTONS,
  Habit,
} from "./data/habitData"; // サンプルデータと型をインポート

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
  const [habits, setHabits] = useState<Habit[]>(createSampleData());
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    exercise: true,
    gym: true,
    cardio: true,
    strength: true,
    stairs: true,
    squat: true,
    measurement: true,
    weight: true,
    learning: true,
    schoo: true,
    programming: true,
    frontend: true,
  });
  console.log(habits);
  // Default date range: Today and 13 days after (14 days total)
  const today = new Date();
  const defaultEndDate = new Date();
  const defaultStartDate = addDays(today, -DAY_DEF);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

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

    // Toggle completion
    toggleHabitCompletion(habitId, today);

    toast.success(
      isAlreadyCompleted
        ? `${habitName}を取り消しました`
        : `${habitName}を記録しました`,
      {
        description: `${format(today, "yyyy年M月d日", { locale: ja })}`,
      }
    );
  };

  // Get month label for a date
  const getMonthLabel = (date: Date) => {
    return format(date, "M月", { locale: ja });
  };

  // Check if date is the first of the month
  const isFirstOfMonth = (date: Date) => {
    return date.getDate() === 1;
  };

  // Group preset buttons by parent category
  const groupedButtons = PRESET_HABIT_BUTTONS.reduce<NestedGroupedButtons>(
    (acc, presetButton) => {
      const directParentHabitInSample = findHabitById(
        habits,
        presetButton.parentId
      );

      if (directParentHabitInSample) {
        let topLevelParentId: string;
        let currentChildrenArray: PresetDisplayItem[];

        if (directParentHabitInSample.parentId) {
          // プリセットボタンの親が、さらに親を持つ場合 (例: ジム訪問の親がジム、ジムの親が運動)
          const grandParentHabitInSample = findHabitById(
            habits,
            directParentHabitInSample.parentId
          );
          if (grandParentHabitInSample) {
            topLevelParentId = grandParentHabitInSample.id; // 例: "exercise"
            if (!acc[topLevelParentId]) {
              acc[topLevelParentId] = [];
            }
            // 中間カテゴリ (例: "gym") を探すか作成
            let middleCategory = acc[topLevelParentId].find(
              (item) =>
                item.type === "category" &&
                item.id === directParentHabitInSample.id
            ) as Extract<PresetDisplayItem, { type: "category" }> | undefined;

            if (!middleCategory) {
              middleCategory = {
                type: "category",
                id: directParentHabitInSample.id,
                name: directParentHabitInSample.name,
                children: [],
              };
              acc[topLevelParentId].push(middleCategory);
            }
            currentChildrenArray = middleCategory.children;
          } else {
            // 祖父母が見つからない場合は、直接の親をトップレベルとして扱う (データ不整合の可能性)
            topLevelParentId = directParentHabitInSample.id;
            if (!acc[topLevelParentId]) {
              acc[topLevelParentId] = [];
            }
            currentChildrenArray = acc[topLevelParentId];
          }
        } else {
          // プリセットボタンの親がトップレベルの場合 (例: 散歩の親が運動)
          topLevelParentId = directParentHabitInSample.id; // 例: "exercise"
          if (!acc[topLevelParentId]) {
            acc[topLevelParentId] = [];
          }
          currentChildrenArray = acc[topLevelParentId];
        }

        currentChildrenArray.push({
          type: "button",
          id: presetButton.id,
          name: presetButton.name, // ボタン名は元のシンプルな名前
          originalName: presetButton.name,
        });
      }
      // PRESET_HABIT_BUTTONS の parentId が habits データにない場合は無視 (またはエラー処理)
      return acc;
    },
    {}
  );
  const isCompleted = (habit: Habit, date: Date): boolean => {
    // この関数は HabitDisplayTable に渡すか、そこで再定義

    if (!habit.completedDates) {
      return false;
    }
    if (habit.completedDates.length === 0) {
      return false;
    }

    // 比較対象の日付の時刻部分を0に正規化
    const targetDateNormalized = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    console.log(
      `[isCompleted] Normalized target date: ${targetDateNormalized.toLocaleDateString()}`
    );

    const found = habit.completedDates.some((completedDate) => {
      // completedDates 内の日付も時刻部分を0に正規化して比較
      const completedDateNormalized = new Date(
        completedDate.getFullYear(),
        completedDate.getMonth(),
        completedDate.getDate()
      );
      console.log(
        `[isCompleted] Comparing: ${completedDateNormalized.toLocaleDateString()} with ${targetDateNormalized.toLocaleDateString()}`
      );
      return isEqual(completedDateNormalized, targetDateNormalized);
    });

    console.log(
      `[isCompleted] Result for "${
        habit.name
      }" on ${date.toLocaleDateString()}: ${found}`
    );
    return found;
  };

  return (
    <div className="space-y-6">
      <PresetButtonsSection
        groupedButtons={groupedButtons}
        onToggleHabit={toggleHabitForToday}
        getParentName={(id) => getParentName(habits, id) || "カテゴリ不明"}
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
        habits={habits}
        dates={dates}
        expandedCategories={expandedCategories}
        onToggleCategory={toggleCategory}
        onToggleHabitCompletion={toggleHabitCompletion}
        isCompleted={isCompleted} // isCompleted を渡す
        getCompletedLeafHabits={getCompletedLeafHabits} // getCompletedLeafHabits を渡す
        // isAnyLeafCompleted は HabitDisplayTable 内で isCompleted と getCompletedLeafHabits を使って計算可能
        getMonthLabel={getMonthLabel} // テーブルヘッダー用
        isFirstOfMonth={isFirstOfMonth} // テーブルヘッダー用
      />
    </div>
  );
}
