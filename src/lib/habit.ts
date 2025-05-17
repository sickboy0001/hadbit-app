import { Habit } from "@/types/habit/ui";

// Helper function to find a habit by ID in the hierarchy
export const findHabitById = (habits: Habit[], id: string): Habit | null => {
  for (const habit of habits) {
    if (habit.id === id) {
      return habit;
    }
    if (habit.children) {
      const found = findHabitById(habit.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// Helper function to find all leaf habits in the hierarchy
export const findAllLeafHabits = (habits: Habit[]): Habit[] => {
  const leafHabits: Habit[] = [];
  const traverse = (habit: Habit) => {
    if (!habit.children || habit.children.length === 0) {
      if (habit.logs) {
        // completedDates があるもののみを対象とする
        leafHabits.push(habit);
      }
    } else {
      habit.children.forEach(traverse);
    }
  };
  habits.forEach(traverse);
  return leafHabits;
};

// Find parent category name for a habit
export const getParentName = (habits: Habit[], parentId: string): string => {
  const parent = findHabitById(habits, parentId);
  return parent ? parent.name : "";
};

// findParentNames もここに移動できます。
// 他のユーティリティ関数も適宜追加してください。
