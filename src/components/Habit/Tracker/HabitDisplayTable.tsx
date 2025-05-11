"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Diamond, ChevronDown, ChevronRightIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Assuming Habit type is defined elsewhere and imported, or defined here if specific to this component
type Habit = {
  id: string;
  name: string;
  parentId?: string;
  children?: Habit[];
  completedDates?: Date[];
  level: number;
};

interface HabitDisplayTableProps {
  habits: Habit[];
  dates: Date[];
  expandedCategories: Record<string, boolean>;
  onToggleCategory: (categoryId: string) => void;
  onToggleHabitCompletion: (habitId: string, date: Date) => void;
  isCompleted: (habit: Habit, date: Date) => boolean;
  getCompletedLeafHabits: (habit: Habit, date: Date) => Habit[];
  getMonthLabel: (date: Date) => string;
  isFirstOfMonth: (date: Date) => boolean;
}

const HabitDisplayTable: React.FC<HabitDisplayTableProps> = ({
  habits,
  dates,
  expandedCategories,
  onToggleCategory,
  onToggleHabitCompletion,
  isCompleted,
  getCompletedLeafHabits,
  getMonthLabel,
  isFirstOfMonth,
}) => {
  // Recursive function to render habit rows (moved from HabitTracker)
  const renderHabitRows = (habit: Habit, currentDates: Date[]) => {
    const isExpanded = expandedCategories[habit.id] || false;
    const hasChildren = habit.children && habit.children.length > 0;
    const isLeaf = !hasChildren;

    return (
      <React.Fragment key={habit.id}>
        <TableRow
          className={`${
            !isLeaf
              ? "cursor-pointer bg-gray-200 hover:bg-muted/80" // 通常時の背景を bg-muted に、ホバー時を bg-muted/80 に変更
              : "bg-background/50" // リーフ行は変更なし
          }`}
          onClick={() => !isLeaf && onToggleCategory(habit.id)}
        >
          <TableCell
            className={`${!isLeaf ? "font-medium" : "font-normal"}`}
            style={{ paddingLeft: `${habit.level * 16}px` }}
          >
            <div className="flex items-center">
              {!isLeaf && (
                <>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 mr-2" />
                  )}
                </>
              )}
              {habit.name}
            </div>
          </TableCell>
          {currentDates.map((date, index) => {
            if (isLeaf) {
              return (
                <TableCell
                  key={`${habit.id}-${index}`}
                  className="text-center p-0 h-[40px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHabitCompletion(habit.id, date);
                  }}
                >
                  {isCompleted(habit, date) && (
                    <div className="flex justify-center h-full cursor-pointer">
                      <Diamond
                        className="h-4 w-4 fill-black"
                        style={{ fill: "currentColor" }}
                      />
                    </div>
                  )}
                  {!isCompleted(habit, date) && (
                    <div className="h-full cursor-pointer hover:bg-muted/50" />
                  )}
                </TableCell>
              );
            } else {
              const completedChildren = getCompletedLeafHabits(habit, date);
              const isAnyChildCompleted = completedChildren.length > 0;
              const opacity = Math.max(0.3, 1 - habit.level * 0.15);

              return (
                <TableCell
                  key={`${habit.id}-${index}`}
                  className="text-center p-0 h-[40px]"
                >
                  {isAnyChildCompleted && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-center items-center h-full">
                          <Diamond
                            className="h-4 w-4 fill-current"
                            style={{ opacity }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">完了した項目:</p>
                        <ul className="list-disc pl-4 mt-1">
                          {completedChildren.map((h) => (
                            <li key={h.id}>{h.name}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
              );
            }
          })}
        </TableRow>
        {hasChildren &&
          isExpanded &&
          habit.children?.map((child) => renderHabitRows(child, currentDates))}
      </React.Fragment>
    );
  };

  return (
    <TooltipProvider>
      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] font-bold">Habit</TableHead>
              {dates.map((date, index) => (
                <TableHead
                  key={`date-${index} `}
                  className="min-w-[40px] text-center "
                >
                  {isFirstOfMonth(date) && (
                    // <div className="text-xs text-muted-foreground pb-1">
                    <div className="text-xs text-muted-foreground">
                      {/* 月のラベル下のパディングを削除 */}
                      {getMonthLabel(date)}
                    </div>
                  )}
                  <div
                    className={`leading-none {/* 行間を詰める */}
                      ${date.getDay() === 0 ? "text-red-600 font-semibold" : ""}
                      ${
                        date.getDay() === 6 ? "text-blue-600 font-semibold" : ""
                      }
                    `}
                  >
                    {date.getDate()}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {habits.map((habit) => renderHabitRows(habit, dates))}
          </TableBody>
        </Table>
      </Card>
    </TooltipProvider>
  );
};

export default HabitDisplayTable;
