"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { format, addDays, subDays, isEqual, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner"; // sonner から toast をインポート
import PresetButtonsSection from "../organisms/PresetButtonsSection";
import DateControls from "./DateControls";
import HabitDisplayTable from "./HabitDisplayTable";
import { Habit, TreeItem, HabitLog } from "@/types/habit/ui";
import DialogEdit from "@/components/molecules/DialogEdit"; // DialogEdit をインポート
import { HabitItem } from "@/types/habit/habit_item";
import { useAuth } from "@/contexts/AuthContext";
import {
  readHabitItems,
  readHabitItemTreeWithUserId,
} from "@/app/actions/habit_items";
import { buildTreeFromHabitAndParentReration } from "@/util/treeConverter";
import ModalHabitLogEditForm from "@/components/Habit/organisms/ModalHabitLogEditForm";
import {
  mapTreeItemsToPresetDisplayItems, // 新しいファイルからインポート
} from "@/util/habitTreeConverters";
import {
  DbHabitLog,
  deleteHabitLog,
  insertHabitLog,
  readDbHabitLogsByPeriod,
  updateHabitLog,
} from "@/app/actions/habit_logs";
import { generateDates } from "@/lib/datetime";
import { parseISO } from "date-fns/parseISO"; // ★ parseISO をインポート

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
  const [, startTransition] = useTransition(); // ★ トランジションフック
  const [, setHabitItems] = useState<HabitItem[]>([]);
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]); // ★ 初期値を空配列に変更
  const { user, loading: authLoading } = useAuth(); // ★ 認証状態を取得

  const [habits, setHabits] = useState<Habit[]>([]);
  const [dbHabitLogs, setDbHabitLogs] = useState<DbHabitLog[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({}); // 初期値を空オブジェクトに変更

  // Default date range: Today and 13 days after (14 days total)
  const today = new Date();
  const defaultEndDate = new Date();
  const defaultStartDate = addDays(today, -DAY_DEF);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // --- 編集ダイアログ関連の状態 ---
  const [isLogEditDialogOpen, setIsLogEditDialogOpen] = useState(false);
  const [editingLogData, setEditingLogData] = useState<{
    habitId: string;
    habitName: string;
    originalDate: Date;
    logId: number; // 編集対象のログのID (DBの主キー)
    comment?: string;
  } | null>(null);

  // ダイアログ内で編集中の日付とコメントを管理するstate
  const [editedDateInDialog, setEditedDateInDialog] = useState<
    Date | undefined
  >(undefined);
  const [editedCommentInDialog, setEditedCommentInDialog] =
    useState<string>("");
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

  const refreshHabitLogs = useCallback(async () => {
    if (!user?.userid) return; // ユーザーIDがない場合は何もしない
    if (user === undefined) return; // ユーザーIDがない場合は何もしない
    const userId = user.userid;
    // startDate と endDate を YYYY-MM-DD 形式の文字列に変換
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    // console.log(
    //   "[HabitTracker] Refreshing habit logs for period:",
    //   formattedStartDate,
    //   "to",
    //   formattedEndDate
    // );
    startTransition(async () => {
      try {
        const dbLogs = await readDbHabitLogsByPeriod(
          // dbLogs はDBから取得した生のログデータの配列と仮定
          userId,
          formattedStartDate,
          formattedEndDate
        );
        setDbHabitLogs(dbLogs);

        setHabits((prevHabits) => {
          console.log("[HabitTracker] Fetched DB logs:", dbLogs);

          // DBログをUI用のHabitLog形式に変換し、habitsにマージする再帰関数
          const mergeLogsIntoHabitsRecursive = (
            currentHabitsToUpdate: Habit[],
            fetchedDbLogs: DbHabitLog[] // ★ 型を DbHabitLog[] に変更
          ): Habit[] => {
            return currentHabitsToUpdate.map((h) => {
              // h.id (string) と dbLog.item_id (number or string) を比較
              // String(dbLog.item_id) を使用して文字列として比較
              const relevantDbLogs = fetchedDbLogs.filter((dbLog) => {
                const isMatch = String(dbLog.item_id) === h.id;
                // if (isMatch) console.log(`[HabitTracker] mergeRecursive: Match found! dbLog.item_id: ${dbLog.item_id} === h.id: ${h.id}`);
                return isMatch;
              });

              const newUiLogs: HabitLog[] = relevantDbLogs.map((dbLog) => ({
                id: dbLog.id, // DBのログIDをUIのログオブジェクトに含める
                date: startOfDay(parseISO(dbLog.done_at)),
                comment: dbLog.comment ?? undefined, // null の場合は undefined に
              }));

              const updatedHabit = {
                ...h,
                logs: newUiLogs, // 該当期間のログで完全に置き換える
              };

              if (h.children && h.children.length > 0) {
                updatedHabit.children = mergeLogsIntoHabitsRecursive(
                  h.children,
                  fetchedDbLogs
                );
              }
              return updatedHabit;
            });
          };

          if (!prevHabits || prevHabits.length === 0) {
            return []; // 初期状態などで habits がまだない場合は空配列を返す
          }
          const newHabitsWithLogs = mergeLogsIntoHabitsRecursive(
            prevHabits,
            dbLogs
          );
          console.log(
            "[HabitTracker] Habits after log merge:",
            newHabitsWithLogs
          );
          return newHabitsWithLogs;
        });
      } catch (error) {
        toast.error("習慣記録の読み込みに失敗しました。");
        console.error("Failed to fetch habit logs:", error);
      }
    });
  }, [user, startDate, endDate, startTransition]);

  useEffect(() => {
    if (user?.userid) {
      refreshItems();
    }
  }, [user?.userid, refreshItems]); // refreshItems も依存配列に追加

  useEffect(() => {
    if (user?.userid) {
      refreshHabitLogs();
    }
  }, [user?.userid, startDate, endDate, refreshHabitLogs]); // refreshItems も依存配列に追加

  // treeItems から Habit[] を生成する再帰関数
  const createHabitsFromTreeItemsRecursive = useCallback(
    (items: TreeItem[], parentId?: string, level: number = 0): Habit[] => {
      return items.map((item) => {
        const habit: Habit = {
          id: String(item.id), // IDを文字列に変換
          name: item.name,
          parentId: parentId,
          level: level,
          logs: [], // completedDates の代わりに logs を使用
        };
        if (item.children && item.children.length > 0) {
          habit.children = createHabitsFromTreeItemsRecursive(
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

      // ★ 追加: treeItems から habits が初期化された後にログをリフレッシュ
      refreshHabitLogs();
    }
  }, [treeItems, createHabitsFromTreeItemsRecursive, refreshHabitLogs]); // ★ refreshHabitLogs を追加

  // findHabitById をローカルで定義 (またはインポート元を変更)
  const findHabitById = useCallback(
    (habitsToSearch: Habit[], id: string): Habit | undefined => {
      // この関数は外部のstateやpropsに直接依存していないように見えるが、
      // もし将来的に依存するようになった場合、依存配列に追加する必要がある。
      // 現状では、再帰的に自分自身を呼び出すため、依存配列は空でも問題ないことが多い。
      // ただし、ESLintが警告を出す場合は、その指示に従うのが安全。
      // ここでは、関数定義自体はレンダリング間で変わらないため、空の依存配列でメモ化する。
      for (const habit of habitsToSearch) {
        if (habit.id === id) return habit;
        if (habit.children) {
          const foundInChildren = findHabitById(habit.children, id); // 再帰呼び出し
          if (foundInChildren) return foundInChildren;
        }
      }
      return undefined;
    },
    [] // 依存配列は空。findHabitById は外部の state/props に依存していないため。
  );

  const dates = generateDates(startDate, endDate);

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
  const toggleHabitCompletion = useCallback(
    async (habitId: string, date: Date) => {
      if (!user?.userid) {
        toast.error("ユーザー情報が見つかりません。");
        return;
      }
      const userId = user.userid;
      const itemId = parseInt(habitId, 10);
      if (isNaN(itemId)) {
        toast.error("無効な習慣IDです。");
        return;
      }

      const habit = findHabitById(habits, habitId);
      if (!habit) {
        toast.error("習慣が見つかりません。");
        return;
      }

      const dateToCheck = startOfDay(date);
      const formattedDate = format(dateToCheck, "yyyy-MM-dd");

      const existingLog = habit.logs.find((log) =>
        isEqual(startOfDay(log.date), dateToCheck)
      );

      startTransition(async () => {
        try {
          if (existingLog) {
            // 既に存在する場合は削除
            const success = await deleteHabitLog(userId, itemId, formattedDate);
            if (success) {
              toast.info(`「${habit.name}」の記録を取り消しました`, {
                description: `${format(date, "yyyy年M月d日", {
                  locale: ja,
                })}`,
              });
              await refreshHabitLogs();
            } else {
              toast.error(
                "記録の取り消しに失敗しました。記録が見つからない可能性があります。"
              );
              await refreshHabitLogs(); // UIを同期
            }
          } else {
            // 存在しない場合は追加 (コメントなしで)
            const newLog = await insertHabitLog(
              userId,
              itemId,
              formattedDate,
              null
            ); // コメントはnull
            if (newLog) {
              toast.success(`「${habit.name}」を記録しました`, {
                description: `${format(date, "yyyy年M月d日", {
                  locale: ja,
                })}`,
              });
              await refreshHabitLogs();
            } else {
              toast.error("記録の追加に失敗しました。");
            }
          }
        } catch (error) {
          console.error("Failed to toggle habit completion:", error);
          const errorMessage =
            error instanceof Error ? error.message : "不明なエラー";
          toast.error(`記録の更新中にエラーが発生しました: ${errorMessage}`);
        }
      });
    },
    [user, habits, refreshHabitLogs, startTransition, findHabitById]
  );
  // Toggle habit for today
  const toggleHabitForToday = useCallback(
    async (habitId: string, habitName: string) => {
      const today = new Date();
      const todayDate = startOfDay(today);

      const habit = findHabitById(habits, habitId);
      if (!habit) {
        toast.error("習慣が見つかりません。");
        return;
      }

      const isAlreadyCompletedToday = habit.logs.some((log: HabitLog) =>
        isEqual(startOfDay(log.date), todayDate)
      );

      if (isAlreadyCompletedToday) {
        toast.info(`${habitName}は既に記録済みです`, {
          description: `${format(today, "yyyy年M月d日", { locale: ja })}`,
        });
      } else {
        await toggleHabitCompletion(habitId, today);
      }
    },
    [habits, toggleHabitCompletion, findHabitById]
  );

  const handleOpenLogEditDialog = (habitId: string, date: Date) => {
    console.log("[HabitTracker] handleOpenLogEditDialog called", {
      habitId,
      date: format(date, "yyyy-MM-dd"),
    });
    const habit = findHabitById(habits, habitId);
    if (!habit) {
      console.warn(
        "[HabitTracker] Habit not found in handleOpenLogEditDialog",
        { habitId }
      );
      return;
    }

    const normalizedDate = startOfDay(date);
    // まずUI上のログエントリを探す (これが編集の起点)
    const uiLogEntry = habit.logs.find((log) =>
      isEqual(startOfDay(log.date), normalizedDate)
    );

    if (!uiLogEntry) {
      toast.error("編集対象の記録の詳細が見つかりませんでした。");
      console.warn(
        "[HabitTracker] Log entry or log ID not found for editing.",
        { habitId, date, uiLogEntry }
      );
      return;
    }

    // 次に、UI上のログエントリに対応するDBログを dbHabitLogs から探す
    // habitId (string) と date (Date) をキーに dbHabitLogs (DbHabitLog[]) を検索
    const dbLogForId = dbHabitLogs.find(
      (dbLog) =>
        String(dbLog.item_id) === habitId && // habit.id は string, dbLog.item_id は number or string
        isEqual(startOfDay(parseISO(dbLog.done_at)), normalizedDate) // dbLog.done_at は ISO文字列
    );

    if (!dbLogForId) {
      toast.error(
        "編集対象の記録がデータベースに見つかりませんでした。データ同期の問題の可能性があります。"
      );
      console.warn(
        "[HabitTracker] Corresponding DB log not found for UI log entry.",
        {
          habitId,
          date: format(date, "yyyy-MM-dd"),
          uiLogEntryDate: format(uiLogEntry.date, "yyyy-MM-dd"), // uiLogEntry は存在が保証されている
          uiLogEntryComment: uiLogEntry.comment,
        }
      );
      return;
    }

    const newEditingLogData = {
      habitId: habit.id,
      habitName: habit.name,
      originalDate: normalizedDate,
      logId: dbLogForId.id, // 編集対象のログのIDをセット // ★ 修正: logEntry.id が存在しない可能性がある
      comment: uiLogEntry?.comment || "",
    };

    setEditingLogData(newEditingLogData);
    setEditedDateInDialog(new Date(newEditingLogData.originalDate));
    setEditedCommentInDialog(newEditingLogData.comment || "");
    setIsLogEditDialogOpen(true);
  };

  const handleSaveLogEdit = useCallback(async () => {
    if (!editingLogData || editedDateInDialog === undefined) {
      toast.error("保存に必要な情報が不足しています。");
      return;
    }
    if (!user?.userid) {
      toast.error("ユーザー情報が見つかりません。");
      return;
    }

    const userId = user.userid;
    const { habitId, originalDate, habitName, logId } = editingLogData; // logId を取得
    const itemId = parseInt(habitId, 10);

    if (isNaN(itemId)) {
      toast.error("無効な習慣IDです。");
      return;
    }

    const newDate = startOfDay(editedDateInDialog);
    const newComment =
      editedCommentInDialog.trim() === "" ? null : editedCommentInDialog.trim();

    const originalFormattedDate = format(
      startOfDay(originalDate),
      "yyyy-MM-dd"
    );
    const newFormattedDate = format(newDate, "yyyy-MM-dd");

    startTransition(async () => {
      try {
        if (!isEqual(startOfDay(originalDate), newDate)) {
          // 日付が変更された場合: 古いログを削除し、新しいログを挿入
          const deleteSuccess = await deleteHabitLog(
            userId,
            itemId,
            originalFormattedDate
          );
          // 削除は成功しても失敗しても、新しいログの挿入を試みる
          if (!deleteSuccess) {
            console.warn(
              "[HabitTracker] Failed to delete old log or log did not exist, proceeding with insert."
            );
          }

          const insertedLog = await insertHabitLog(
            userId,
            itemId,
            newFormattedDate,
            newComment
          );

          if (insertedLog) {
            toast.success(
              `「${habitName}」の記録を新しい日付で作成しました。`,
              {
                description: `${format(newDate, "yyyy年M月d日", {
                  locale: ja,
                })}${newComment ? ` - ${newComment.substring(0, 20)}...` : ""}`,
              }
            );
          } else {
            toast.error("新しい日付での記録作成に失敗しました。");
            // 失敗した場合、古いログを復元するロジックは複雑なので、ここではリフレッシュのみ
          }
        } else {
          // 日付が変更されない場合: 既存のログを更新
          const updatedLog = await updateHabitLog(
            logId, // 既存のログIDを使用
            newFormattedDate, // 日付は同じだがAPIの仕様に合わせて渡す
            newComment
          );
          if (updatedLog) {
            toast.success(`「${habitName}」の記録を更新しました。`, {
              description: `${format(newDate, "yyyy年M月d日", { locale: ja })}${
                newComment ? ` - ${newComment.substring(0, 20)}...` : ""
              }`,
            });
          } else {
            toast.error("記録の更新に失敗しました。");
          }
        }
        // 成功・失敗に関わらず、UIを最新の状態に同期し、ダイアログを閉じる
        await refreshHabitLogs();
        setIsLogEditDialogOpen(false);
        setEditingLogData(null);
        setEditedDateInDialog(undefined);
        setEditedCommentInDialog("");
      } catch (error) {
        console.error("Failed to save habit log edit:", error);
        const errorMessage =
          error instanceof Error ? error.message : "不明なエラー";
        if (
          errorMessage.includes(
            "duplicate key value violates unique constraint"
          )
        ) {
          toast.error(
            `日付 ${format(newDate, "yyyy年M月d日", {
              locale: ja,
            })} には既に「${habitName}」の記録が存在します。`
          );
        } else {
          toast.error(`記録の更新中にエラーが発生しました: ${errorMessage}`);
        }
      }
    });
  }, [
    editingLogData,
    editedDateInDialog,
    editedCommentInDialog,
    user,
    refreshHabitLogs,
    startTransition,
    setIsLogEditDialogOpen, // useState setters are stable
    setEditingLogData,
    setEditedDateInDialog,
    setEditedCommentInDialog,
  ]);

  const handleDialogClose = (open: boolean) => {
    setIsLogEditDialogOpen(open);
    if (!open) {
      setEditingLogData(null);
      setEditedDateInDialog(undefined);
      setEditedCommentInDialog("");
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

  // Group preset buttons using treeItems
  const groupedButtons = treeItems.reduce<NestedGroupedButtons>(
    (acc, topLevelItem) => {
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
    if (!habit.logs || habit.logs.length === 0) {
      // logs をチェック
      return false;
    }
    const targetDateNormalized = startOfDay(date);
    return habit.logs.some((log) => {
      // logs を走査
      const logDateNormalized = startOfDay(log.date);
      return isEqual(logDateNormalized, targetDateNormalized);
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
        onOpenLogEditDialog={handleOpenLogEditDialog} // ★ 編集ダイアログを開く関数を渡す
      />

      {/* DialogEdit を使用して編集ダイアログをレンダリング */}
      {editingLogData && ( // editingLogData がある場合のみ DialogEdit をレンダリング（タイトル設定のため）
        <DialogEdit
          open={isLogEditDialogOpen}
          onOpenChange={handleDialogClose}
          title={`「${editingLogData.habitName}」の記録を編集`}
          onSave={handleSaveLogEdit}
          // DialogEdit が保存ボタンの disabled 状態を内部で制御する場合、
          // isSaveDisabled={!editedDateInDialog} のような prop があれば渡す
          // もし DialogEdit が children の内容だけで disabled を判断できない場合は、
          // handleSaveLogEdit 内でのチェックが引き続き重要
        >
          <ModalHabitLogEditForm
            currentDate={editedDateInDialog}
            comment={editedCommentInDialog}
            onDateChange={setEditedDateInDialog}
            onCommentChange={setEditedCommentInDialog}
          />
        </DialogEdit>
      )}
    </div>
  );
}
