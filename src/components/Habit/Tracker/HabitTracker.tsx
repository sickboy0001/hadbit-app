"use client";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PresetButtonsSection from "../organisms/PresetButtonsSection";
import DateControls from "./DateControls";
import {
  addDays,
  format,
  isEqual,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import {
  addHabitLogEntry,
  deleteHabitLogByIdEntry,
  fetchHabitDataForUI,
  fetchSortedHabitLogs,
  updateHabitLogEntry,
} from "../ClientApi/HabitLogClientApi";
import { HabitItem, HabitItemInfo } from "@/types/habit/habit_item";
import { NestedGroupedButtons, TreeItem } from "@/types/habit/ui";
import { useAuth } from "@/contexts/AuthContext";
import { DbHabitLog } from "@/app/actions/habit_logs";
import { buildTreeFromHabitAndParentReration } from "@/util/treeConverter";
import { mapTreeItemsToPresetDisplayItems } from "@/util/habitTreeConverters";
import { generateDates } from "@/lib/datetime";
import GanttChart from "./GattChartHabitTracker";

import ModalDbHabitLogEditForm from "../organisms/ModalDbHabitLogEditForm";
import ConfirmationDialog from "@/components/molecules/ConfirmationDialog";
import DialogEdit from "@/components/molecules/DialogEdit";
import { ja } from "date-fns/locale/ja";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { color_def } from "./dummy";
import { showCustomToast } from "@/components/organisms/CustomToast";
import LogSummarys from "./LogSummarys";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Tabsコンポーネントをインポート
import {
  getLogSummarySettingsOrCreateDummy,
  persistLogSummarySettings,
} from "../ClientApi/HabitSettingClientApi";
import { HabitLogSummarySettings } from "@/types/habit/logSummaryItemSetting";

const DAY_DIFF = 20;

const HabitTracker = () => {
  // Default date range: Today and 13 days after (14 days total)
  const today = useMemo(() => new Date(), []); // today もメモ化
  const defaultEndDate = useMemo(() => new Date(), []); // defaultEndDate をメモ化
  const defaultStartDate = useMemo(() => addDays(today, -DAY_DIFF), [today]); // defaultStartDate をメモ化

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const { user, loading: _authLoading } = useAuth(); // ★ 認証状態を取得
  const [habitItems, setHabitItems] = useState<HabitItem[]>([]);
  const [habitItemInfos, setHabitItemInfos] = useState<HabitItemInfo[]>([]);
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]); // ★ 初期値を空配列に変更
  const [readHabitlogs, setReadHabitLogs] = useState<DbHabitLog[]>([]);

  // ログの編集・削除関連のstate
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLogEditDialogOpen, setIsLogEditDialogOpen] = useState(false);
  const [editingLogData, setEditingLogData] = useState<DbHabitLog | null>(null);
  const [logToDelete, setLogToDelete] = useState<DbHabitLog | null>(null);
  const [habitLogSummarySettings, setHabitLogSummarySettings] =
    useState<HabitLogSummarySettings | null>(null);
  // ポップオーバーの開閉状態
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // ポップオーバー表示中のログデータ
  const [popoverLogData, setPopoverLogData] = useState<DbHabitLog | null>(null);
  // ポップオーバーのアンカー要素 (◆ボタン)
  const [popoverAnchorEl, setPopoverAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const [ganttExpandedCategories, setGanttExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // userId が常に number 型になるように修正。
  // user.userid が存在しない場合は 0 を設定（0 が無効なユーザーIDであることを想定）。
  const userId: number = user?.userid ?? 0;

  // habitLogSummarySettings の前の値を保持するための ref
  const prevHabitLogSummarySettingsRef = useRef<HabitLogSummarySettings | null>(
    null
  ); // 初期値を null に設定

  // useEffect(() => {
  //   console.log("HabitTracker mounted");
  // });

  const refreshItems = useCallback(() => {
    if (!user?.userid) return; // ユーザーIDがない場合は何もしない
    // ガードを通過したことを確認するログ
    console.log(
      "[refreshItems] Proceeding after guard. user.userid:",
      user?.userid,
      "Effective userId for fetch:",
      userId
    );

    startTransition(async () => {
      try {
        // 実際にAPIを呼び出す直前のログ
        console.log(
          "[refreshItems] INSIDE startTransition - Calling fetchHabitDataForUI with userId:",
          userId
        );

        const {
          habitItems: fetchedHabitItems,
          habitItemTreeRaw: fetchedHabitItemTreeRaw,
        } = await fetchHabitDataForUI(userId);

        setHabitItems(fetchedHabitItems);

        const nowTreeItems = buildTreeFromHabitAndParentReration(
          fetchedHabitItems,
          fetchedHabitItemTreeRaw
        );
        console.log("nowTreeItems", nowTreeItems);
        setTreeItems(nowTreeItems);
      } catch (error) {
        showCustomToast({
          message: "リストの読み込みに失敗しました。",
          submessage: "サーバーとの通信中にエラーが発生した可能性があります。",
          type: "error",
        });
        console.error("Failed to fetch habit items:", error);
      }
    });
  }, [userId, user?.userid]); // userId と、その元となる user?.userid を依存配列に追加

  // ユーザー情報が変更された際に habitItems をリフレッシュするための useEffect
  useEffect(() => {
    if (user?.userid) {
      refreshItems();
    }
  }, [user?.userid, refreshItems]); // refreshItems は useCallback でメモ化されているため依存配列に含める

  const refreshHabitLogs = useCallback(async () => {
    if (!user?.userid || userId === 0) return;
    // startDate と endDate を YYYY-MM-DD 形式の文字列に変換
    const formattedStartDate = format(defaultStartDate, "yyyy-MM-dd");
    const formattedEndDate = format(defaultEndDate, "yyyy-MM-dd");

    startTransition(async () => {
      try {
        const sortedLogs = await fetchSortedHabitLogs(
          userId,
          formattedStartDate,
          formattedEndDate
        );
        setReadHabitLogs(sortedLogs);
        console.log("habitlogs", sortedLogs);
      } catch (error) {
        showCustomToast({
          message: "習慣記録の読み込みに失敗しました。",
          submessage: "データの取得中に問題が発生しました。",
          type: "error",
        });
        console.error("Failed to fetch habit logs:", error);
      }
    });
  }, [user, defaultStartDate, defaultEndDate, userId]); // startTransition は安定しているので削除, userId を追加

  // treeItems が変更されたら、ganttExpandedCategories を初期化 (例: 全て展開)
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    treeItems.forEach((category) => {
      initialExpanded[String(category.id)] = true; // デフォルトで展開
    });
    setGanttExpandedCategories(initialExpanded);
  }, [treeItems]);

  //HabitItemInfo
  useEffect(() => {
    if (habitItems.length > 0 && color_def.length > 0) {
      const newHabitItemInfos = habitItems.map((habitItem) => {
        // color_def からランダムに色を選択
        const randomColorIndex = Math.floor(Math.random() * color_def.length);
        return {
          id: habitItem.id, // HabitItem の ID を使用
          info_string: color_def[randomColorIndex],
        };
      });
      // console.log("newHabitItemInfos", newHabitItemInfos);
      // HabitItemInfo")
      setHabitItemInfos(newHabitItemInfos);
    }
  }, [habitItems]); // habitItems が変更されたときに実行

  useEffect(() => {
    if (user?.userid) {
      const userId = user.userid;
      const settingType = "habit_log_summary_table"; // 設定タイプを定義

      const loadAndSetSummarySettings = async () => {
        if (
          habitLogSummarySettings !== null &&
          prevHabitLogSummarySettingsRef.current !== undefined
        ) {
          return;
        }
        try {
          // ★ DaoHabitLog の関数を呼び出す
          const allHabitItemIds = habitItems.map((item) => item.id);
          const settings = await getLogSummarySettingsOrCreateDummy(
            userId,
            settingType,
            allHabitItemIds
          );
          setHabitLogSummarySettings(settings);
        } catch (error) {
          // DAO関数内でエラーハンドリングとフォールバックが行われるため、
          // ここでのエラーハンドリングは簡略化できるか、UI固有のエラー表示に集中できる
          console.error(
            "Error in loadAndSetSummarySettings (UI layer):",
            error
          );
          showCustomToast({
            message: "サマリー設定の読み込みまたは作成に失敗しました。",
            submessage: "設定データの処理中にエラーが発生しました。",
            type: "error",
          });
        }
      };

      loadAndSetSummarySettings();
    }
  }, [user?.userid, habitItems, habitLogSummarySettings]);

  useEffect(() => {
    if (user?.userid) {
      refreshHabitLogs();
    }
  }, [user?.userid, defaultStartDate, defaultEndDate, refreshHabitLogs]); // userId を user?.userid に変更

  // habitLogSummarySettings が変更されたらDBに保存する useEffect
  useEffect(() => {
    // habitLogSummarySettings が初期値(null)から変更された後、かつユーザーIDが存在する場合に実行
    if (
      habitLogSummarySettings &&
      user?.userid &&
      prevHabitLogSummarySettingsRef.current !== habitLogSummarySettings // 実際に値が変更されたか確認
    ) {
      // サーバーアクションの呼び出しを startTransition でラップ
      startTransition(() => {
        const persistSettings = async () => {
          if (user?.userid === undefined) {
            // このチェックは上の user?.userid でカバーされるが念のため
            console.log(
              "User ID is undefined, skipping summary settings persistence."
            );
            return;
          }
          try {
            const success = await persistLogSummarySettings(
              user.userid, // undefinedでないことは上で確認済み
              "habit_log_summary_table",
              habitLogSummarySettings // 現在のステートを保存
            );
            if (!success) {
              showCustomToast({
                message: "サマリー設定の自動保存に失敗しました。",
                submessage: "データベースへの保存中に問題が発生しました。",
                type: "error",
              });
            }
          } catch (error) {
            // DAO側でconsole.errorは出力される想定
            console.error("Error in persistSettings (UI layer):", error);
            showCustomToast({
              message:
                "サマリー設定の自動保存中に予期せぬエラーが発生しました。",
              submessage: "しばらくしてからもう一度お試しください。",
              type: "error",
            });
          }
        };
        persistSettings();
      });
    }
    // 現在の habitLogSummarySettings の値を ref に保存
    prevHabitLogSummarySettingsRef.current = habitLogSummarySettings;
  }, [habitLogSummarySettings, user?.userid]); // habitLogSummarySettings または user.userid が変更されたら実行

  // item_id (number) から習慣名 (string) を取得するヘルパー関数 (useCallbackでメモ化)
  const getHabitItemNameById = useCallback(
    (itemId: number): string => {
      const foundHabitItem = habitItems.find((item) => item.id === itemId);
      return foundHabitItem ? foundHabitItem.name : "不明な習慣";
    },
    [habitItems] // habitItems state が変更されたら再生成
  );

  const getParentName = (parentId: string): string => {
    const parentIdNum = parseInt(parentId, 10);
    // treeItems はトップレベルのアイテムの配列なので、IDが一致するものを探す
    const foundItem = treeItems.find((item) => item.id === parentIdNum);
    return foundItem?.name || "カテゴリ不明";
  };

  // ★ ポップオーバーを閉じるハンドラー
  const handlePopoverClose = useCallback(() => {
    setIsPopoverOpen(false);
    setPopoverLogData(null);
    setPopoverAnchorEl(null);
  }, []);

  // ★ ログ編集ダイアログを開く汎用ハンドラー
  const openEditDialogForLog = useCallback(
    (logToEdit: DbHabitLog) => {
      console.log("openEditDialogForLog called with:", logToEdit);
      setEditingLogData(logToEdit);
      setIsLogEditDialogOpen(true);
      // ポップオーバーが開いている場合は閉じる
      if (isPopoverOpen) {
        handlePopoverClose();
      }
    },
    [isPopoverOpen, handlePopoverClose]
  );

  const toggleHabitAdd = useCallback(
    async (habitId: string, habitName: string) => {
      const today = new Date();
      const todayDate = startOfDay(today);
      const formattedDate = format(todayDate, "yyyy-MM-dd");
      console.log("[togglehabitAdd]called", habitId, habitName);

      if (!user?.userid) {
        showCustomToast({
          message: "ユーザー情報が見つかりません。",
          submessage: "ログインしているか確認してください。",
          type: "error",
        });

        return;
      }
      const userId = user.userid;
      const itemId = parseInt(habitId, 10);

      if (isNaN(itemId)) {
        showCustomToast({
          message: "無効な習慣IDです。",
          submessage: "システムエラーが発生しました。",
          type: "error",
        });
        return;
      }

      // 既に今日記録されているかチェック (habitlogs state を使用)
      const isAlreadyCompletedToday = readHabitlogs.some(
        (log) =>
          log.item_id === itemId &&
          isEqual(startOfDay(parseISO(log.done_at)), todayDate)
      );

      if (isAlreadyCompletedToday) {
        showCustomToast({
          message: `「${habitName}」は既に本日記録済みです。`,
          submessage: "同じ記録は1日に1回までです。",
          type: "success", // CustomToast に info タイプがないため success で代用
        });

        return;
      }

      startTransition(async () => {
        try {
          const newLog = await addHabitLogEntry(
            userId,
            itemId,
            formattedDate,
            null
          ); // ★ DAO関数を呼び出し

          if (newLog) {
            showCustomToast({
              message: `「${habitName}」を記録しました。`,
              submessage: `${format(today, "yyyy年M月d日", {
                locale: ja,
              })}`,
              buttonTitle: "編集",
              onEditClick: () => openEditDialogForLog(newLog),
              type: "success",
            });
            await refreshHabitLogs(); // ログリストを再読み込みしてUIを更新
          } else {
            showCustomToast({
              message: "記録の追加に失敗しました。",
              submessage: "データベースへの保存中に問題が発生しました。",
              type: "error",
            });
          }
        } catch (error) {
          console.error("Failed to insert habit log for today:", error);
          showCustomToast({
            message: "記録の追加中にエラーが発生しました。",
            submessage: "予期せぬエラーが発生しました。",
            type: "error",
          });
        }
      });
    },
    [user, readHabitlogs, refreshHabitLogs, openEditDialogForLog]
  );

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

  // ★ ガントチャートのカテゴリ開閉をトグルする関数
  const toggleGanttCategory = useCallback((categoryId: string) => {
    setGanttExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  // Handle start date change
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;

    setStartDate(date);
    setEndDate(addDays(date, DAY_DIFF));
  };

  // Handle end date change
  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;

    setEndDate(date);
    setStartDate(subDays(date, DAY_DIFF));
  };

  // ★ 削除確認ダイアログの確定ハンドラー
  const handleConfirmDelete = useCallback(async () => {
    const userId: number = user?.userid ?? 0;
    console.log("handleConfirmDelete called", userId, logToDelete);
    if (!logToDelete || !userId) {
      showCustomToast({
        message: "削除対象の記録またはユーザー情報が見つかりません。",
        submessage: "システムエラーが発生しました。",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    const { id, item_id, done_at } = logToDelete;
    const habitName = getHabitItemNameById(item_id);
    const formattedDate = format(parseISO(done_at), "yyyy-MM-dd");

    startTransition(async () => {
      try {
        const success = await deleteHabitLogByIdEntry(userId, id); // ★ DAO関数を呼び出し

        if (success) {
          showCustomToast({
            message: `「${habitName}」の記録を削除しました。`,
            submessage: `${format(parseISO(done_at), "yyyy年M月d日", {
              locale: ja,
            })}`,
            type: "success",
          });
          await refreshHabitLogs();
        } else {
          console.log("deleteHabit error", userId, item_id, formattedDate);
          showCustomToast({
            message: "記録の削除に失敗しました。",
            submessage: "データベースからの削除中に問題が発生しました。",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Failed to delete habit log:", error);
        showCustomToast({
          message: "記録の削除中にエラーが発生しました。",
          submessage: "予期せぬエラーが発生しました。",
          type: "error",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setLogToDelete(null);
      }
    });
  }, [user, logToDelete, refreshHabitLogs, getHabitItemNameById]);

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

  // ★ ログの◆をクリックしたときのハンドラー
  const handleGanttLogClick = useCallback(
    (log: DbHabitLog, event: React.MouseEvent<HTMLButtonElement>) => {
      setPopoverLogData(log);
      setPopoverAnchorEl(event.currentTarget); // クリックされたボタンをアンカーとして設定
      setIsPopoverOpen(true);
    },
    []
  );

  // ★ 編集ボタンクリック時のハンドラー
  const handleEditClick = useCallback(() => {
    console.log("handleEditClick called", popoverLogData);
    if (popoverLogData) {
      setEditingLogData(popoverLogData);
      setIsLogEditDialogOpen(true);
      handlePopoverClose(); // ポップオーバーを閉じる
    }
  }, [popoverLogData, handlePopoverClose]);

  // ★ 削除ボタンクリック時のハンドラー
  const handleDeleteClick = useCallback(() => {
    console.log("handleDeleteClick called", popoverLogData);
    if (popoverLogData) {
      setLogToDelete(popoverLogData);
      setIsDeleteDialogOpen(true);
      handlePopoverClose(); // ポップオーバーを閉じる
    }
  }, [popoverLogData, handlePopoverClose]);

  // ★ 編集ダイアログを閉じるハンドラー
  const handleLogEditDialogClose = useCallback(() => {
    setIsLogEditDialogOpen(false);
    setEditingLogData(null); // 編集データをクリア
  }, []);

  // ★ 編集ダイアログの保存ボタンクリック時のハンドラー
  const handleLogEditDialogSave = useCallback(async () => {
    if (!userId) {
      showCustomToast({
        message: "ユーザー情報が見つかりません。",
        submessage: "ログインしているか確認してください。",
        type: "error",
      });

      return;
    }
    if (editingLogData === null) {
      console.log("handleLogEditDialogSave called but editingLogData is null");
      showCustomToast({
        message: "編集データがありません。",
        submessage: "システムエラーが発生しました。",
        type: "error",
      });
      return;
    }
    startTransition(async () => {
      try {
        const success = await updateHabitLogEntry(
          editingLogData.id,
          editingLogData.done_at,
          editingLogData.comment
        );

        if (success) {
          showCustomToast({
            message: `「${getHabitItemNameById(
              editingLogData.item_id
            )}」の記録を更新しました。`,
            submessage: `${format(today, "yyyy年M月d日", {
              locale: ja,
            })}`,
            type: "success",
          });
          await refreshHabitLogs(); // ログを再取得してGanttChartを更新
          handleLogEditDialogClose(); // ダイアログを閉じる
        } else {
          showCustomToast({
            message: "記録の更新に失敗しました。",
            submessage: "データベースへの保存中に問題が発生しました。",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Failed to update habit log:", error);
        showCustomToast({
          message: "障害が発生しました。",
          submessage: "記録の更新中にエラーが発生しました。",
          type: "error",
          // buttonTitle: "詳細を見る",
          // onEditClick: () => { /* ... */ }
        });
      }
    });
  }, [
    editingLogData,
    refreshHabitLogs,
    getHabitItemNameById,
    userId, // userId を追加
    handleLogEditDialogClose, // handleLogEditDialogClose を追加
    today,
  ]);

  // ★ 削除確認ダイアログのキャンセルハンドラー
  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setLogToDelete(null); // 削除対象のログデータをクリア
  }, []);

  // ★ テスト用トースト呼び出しボタン (開発中のみ表示するなどの工夫も可能)
  const handleTestSuccessToast = () => {
    showCustomToast({
      message: "テスト成功メッセージ",
      submessage: "これは成功トーストのサブメッセージです。",
      type: "success",
      buttonTitle: "編集 (テスト)",
      onEditClick: () => console.log("テスト編集ボタンクリック"),
    });
  };

  const handleTestErrorToast = () => {
    showCustomToast({
      message: "テストエラーメッセージ",
      submessage: "これはエラートーストのサブメッセージです。",
      type: "error",
    });
  };

  return (
    <div className="space-y-6">
      <PresetButtonsSection
        groupedButtons={groupedButtons}
        onToggleHabit={toggleHabitAdd}
        getParentName={getParentName} // 更新されたゲッター関数を使用
      />

      <DateControls
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onGoToPreviousRange={goToPreviousRange}
        onGoToNextRange={goToNextRange}
      />

      {/* 編集ダイアログ */}
      {editingLogData && ( // editingLogData がある場合のみ DialogEdit をレンダリング（タイトル設定のため）
        <DialogEdit
          open={isLogEditDialogOpen}
          onOpenChange={handleLogEditDialogClose}
          // ★ タイトルを編集。editingLogData.item_id から習慣名を取得
          title={`「${
            editingLogData ? getHabitItemNameById(editingLogData.item_id) : ""
          }」の記録を編集`}
          onSave={handleLogEditDialogSave}
        >
          <ModalDbHabitLogEditForm
            dbHabitlog={editingLogData}
            setDbHabitlog={setEditingLogData}
          />
        </DialogEdit>
      )}
      {/* ポップオーバーコンポーネント */}

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        {/* PopoverAnchor を使用して、動的にアンカー要素を指定 */}
        {popoverAnchorEl && (
          <PopoverAnchor virtualRef={{ current: popoverAnchorEl }} />
        )}
        <PopoverContent className="w-auto p-0 z-50" sideOffset={5}>
          <div className="flex flex-col">
            <div className="p-2 border-b">
              <h4 className="font-semibold text-sm">
                {popoverLogData
                  ? getHabitItemNameById(popoverLogData.item_id)
                  : "記録"}
              </h4>
              <p className="text-xs text-gray-500">
                {popoverLogData
                  ? format(
                      parseISO(popoverLogData.done_at),
                      "yyyy年M月d日 (EEE)",
                      { locale: ja }
                    )
                  : ""}
                {popoverLogData ? popoverLogData.comment : ""}
              </p>
              {popoverLogData?.comment && (
                <p className="text-xs text-gray-700 mt-1">
                  コメント: {popoverLogData.comment}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none"
              onClick={handleEditClick}
            >
              <PencilIcon className="mr-2 h-4 w-4" /> 編集
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-none"
              onClick={handleDeleteClick}
            >
              <Trash2Icon className="mr-2 h-4 w-4" /> 削除
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* 削除確認ダイアログ */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        dialogTitle="記録の削除確認"
        dialogMessage={
          logToDelete // logToDelete が null でないことを再度確認 (型安全のため)
            ? `「${getHabitItemNameById(logToDelete.item_id)}」の${format(
                parseISO(logToDelete.done_at),
                "yyyy年M月d日",
                { locale: ja }
              )}の記録を本当に削除しますか？この操作は元に戻せません。`
            : "記録を本当に削除しますか？この操作は元に戻せません。" // フォールバックメッセージ
        }
        confiremButtonName="削除する"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Tabsコンポーネントを使用して表示を切り替える */}
      <Tabs defaultValue="gantt-chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gantt-chart">ガントチャート</TabsTrigger>
          <TabsTrigger value="log-summary">ログサマリ</TabsTrigger>
        </TabsList>
        <TabsContent value="gantt-chart">
          <GanttChart
            habitItems={habitItems}
            habitItemInfos={habitItemInfos}
            habitLogs={readHabitlogs}
            treeItems={treeItems}
            startDate={startDate}
            endDate={endDate}
            onLogClick={handleGanttLogClick}
            expandedCategories={ganttExpandedCategories}
            onToggleCategory={toggleGanttCategory}
          />
        </TabsContent>
        <TabsContent value="log-summary">
          <LogSummarys
            habitItems={habitItems}
            habitItemInfos={habitItemInfos}
            treeItems={treeItems}
            habitLogs={readHabitlogs}
            startDate={startDate}
            endDate={endDate}
            onLogClick={handleGanttLogClick}
            habitLogSummarySettings={habitLogSummarySettings}
            setHabitLogSummarySettings={setHabitLogSummarySettings}
            // updateSettingsInDb={updateSettingsInDb}
          />
        </TabsContent>
      </Tabs>
      {/* <div className="mt-8 p-4 border-t">
        <h2 className="text-xl font-bold mb-4">
          カラーパレット テキスト表示テスト
        </h2>
        <ColorDisplayTest title="テスト" colors={color_def} />
      </div> */}
      {process.env.NODE_ENV === "development" && (
        <div className="space-y-6">
          {/* ... (既存のコンポーネント) ... */}
          <div className="mt-8 p-4 border-t">
            <h2 className="text-xl font-bold mb-4">トーストテスト</h2>
            <div className="flex space-x-2">
              <Button onClick={handleTestSuccessToast}>成功トースト表示</Button>
              <Button onClick={handleTestErrorToast} variant="destructive">
                エラートースト表示
              </Button>
            </div>
          </div>
          {/* ... (既存のコンポーネントの続き) ... */}
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
