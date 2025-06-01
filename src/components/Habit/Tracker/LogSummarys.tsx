"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  startTransition,
  useRef,
} from "react";
import { DbHabitLog } from "@/app/actions/habit_logs"; // このパスをプロジェクトに合わせて調整してください
import { HabitItem, HabitItemInfo } from "@/types/habit/habit_item"; // このパスをプロジェクトに合わせて調整してください

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import LogSummaryItem from "./LogSummaryItem";
import ModalSelectHabitItems from "../organisms/ModalSelectHabitItems";
import { HabitLogSummarySettings } from "@/types/habit/LogSumsSetting";
import {
  addNewSummaryToSettings,
  getLeafHabitItems,
} from "../ClientApi/HabitSettingService";
import { TreeItem } from "@/types/habit/ui";

import { useAuth } from "@/contexts/AuthContext";
import { showCustomToast } from "@/components/organisms/CustomToast";
import DateControls from "./DateControls"; // DateControls をインポート
import { format, addDays, subDays } from "date-fns";
import { DAY_DIFF } from "@/constants/dateConstants"; // 定数をインポート
import {
  fetchHabitDataForUI,
  fetchSortedHabitLogs,
} from "../ClientApi/HabitLogClientApi";
import { buildTreeFromHabitAndParentReration } from "@/util/treeConverter";
import { color_def } from "./dummy"; // color_def をインポート

interface LogSummarysProps {
  // habitItems: HabitItem[];
  // treeItems: TreeItem[];
  // habitItemInfos: HabitItemInfo[];
  // habitLogs: DbHabitLog[];
  // startDate: Date;
  // endDate: Date;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  habitLogSummarySettings: HabitLogSummarySettings | null;
  setHabitLogSummarySettings: React.Dispatch<
    React.SetStateAction<HabitLogSummarySettings | null>
  >;
  refreshTrigger?: number; // ★ 再読み込みトリガー用のprops
}

const LogSummarys: React.FC<LogSummarysProps> = ({
  // habitItems,
  // treeItems,
  // habitItemInfos = [],
  // habitLogs,
  // startDate,
  // endDate,
  onLogClick,
  habitLogSummarySettings,
  setHabitLogSummarySettings,
  refreshTrigger,
  // updateSettingsInDb, // Propsとして受け取る
}) => {
  const { user } = useAuth();
  const userId = user?.userid ?? 0;

  const today = useMemo(() => new Date(), []);
  const defaultEndDate = useMemo(() => new Date(), []);
  const defaultStartDate = useMemo(() => addDays(today, -DAY_DIFF), [today]);

  const [internalHabitItems, setInternalHabitItems] = useState<HabitItem[]>([]);
  const [internalHabitItemInfos, setInternalHabitItemInfos] = useState<
    HabitItemInfo[]
  >([]);
  const [internalTreeItems, setInternalTreeItems] = useState<TreeItem[]>([]);

  const [internalStartDate, setInternalStartDate] = useState(defaultStartDate);
  const [internalEndDate, setInternalEndDate] = useState(defaultEndDate);
  const [internalHabitLogs, setInternalHabitLogs] = useState<DbHabitLog[]>([]);

  const [isSelectHabitModalOpen, setIsSelectHabitModalOpen] = useState(false);
  const [selectingHabitForOrderId, setSelectingHabitForOrderId] = useState<
    string | null
  >(null);

  const componentId = useRef(
    `LogSummarys-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  const refreshInternalHabitLogs = useCallback(async () => {
    if (!userId || userId === 0) return;

    const formattedStartDate = format(internalStartDate, "yyyy-MM-dd");
    const formattedEndDate = format(internalEndDate, "yyyy-MM-dd");

    startTransition(async () => {
      try {
        const sortedLogs = await fetchSortedHabitLogs(
          userId,
          formattedStartDate,
          formattedEndDate
        );
        setInternalHabitLogs(sortedLogs);
        console.log(
          `[${componentId}] Fetched internal habit logs for LogSummarys:`,
          sortedLogs
        );
      } catch (error) {
        showCustomToast({
          message: "サマリーの記録読み込みに失敗しました。",
          submessage: "データの取得中に問題が発生しました。",
          type: "error",
        });
        console.error(
          `[${componentId}] Failed to fetch internal habit logs for LogSummarys:`,
          error
        );
      }
    });
  }, [userId, internalStartDate, internalEndDate, componentId]);

  const refreshInternalItems = useCallback(async () => {
    if (!userId || userId === 0) return;
    startTransition(async () => {
      try {
        const {
          habitItems: fetchedHabitItems,
          habitItemTreeRaw: fetchedHabitItemTreeRaw,
        } = await fetchHabitDataForUI(userId);

        setInternalHabitItems(fetchedHabitItems);
        const nowTreeItems = buildTreeFromHabitAndParentReration(
          fetchedHabitItems,
          fetchedHabitItemTreeRaw
        );
        setInternalTreeItems(nowTreeItems);
      } catch (error) {
        showCustomToast({
          message: "サマリーの項目読み込みに失敗しました。",
          submessage: "データの取得中に問題が発生しました。",
          type: "error",
        });
        console.error(
          `[${componentId}] Failed to fetch internal items for LogSummarys:`,
          error
        );
      }
    });
  }, [userId, componentId]);

  useEffect(() => {
    if (userId) {
      refreshInternalHabitLogs();
      refreshInternalItems();
    }
  }, [
    userId,
    internalStartDate,
    internalEndDate,
    refreshInternalHabitLogs,
    refreshTrigger,
    refreshInternalItems,
  ]);

  // internalHabitItems が変更されたら internalHabitItemInfos を生成
  useEffect(() => {
    if (internalHabitItems.length > 0 && color_def.length > 0) {
      const newHabitItemInfos = internalHabitItems.map((habitItem) => {
        const randomColorIndex = Math.floor(Math.random() * color_def.length);
        return {
          id: habitItem.id,
          info_string: color_def[randomColorIndex],
        };
      });
      setInternalHabitItemInfos(newHabitItemInfos);
    }
  }, [internalHabitItems]);

  const toggleSummary = (orderId: string) => {
    if (!habitLogSummarySettings) return;
    const currentSummarySetting = habitLogSummarySettings.logSummary[orderId];
    if (!currentSummarySetting) return;

    const newSettingsState = {
      ...habitLogSummarySettings,
      logSummary: {
        ...habitLogSummarySettings.logSummary,
        [orderId]: {
          ...currentSummarySetting,
          isExpanded: !currentSummarySetting.isExpanded,
        },
      },
    };
    setHabitLogSummarySettings(newSettingsState);
    // updateSettingsInDb(newSettingsState);
  };

  const toggleAddSummary = () => {
    if (!habitLogSummarySettings && internalHabitItems.length === 0) {
      // 初期化もできない場合は何もしない（またはエラー表示）
      console.warn(
        "Cannot add summary: initial settings and habit items are not available."
      );
      return;
    }
    const newOrderId = String(crypto.randomUUID());
    const allHabitItemIds = internalHabitItems.map((item) => item.id);
    const newSettingsState = addNewSummaryToSettings(
      habitLogSummarySettings,
      newOrderId,
      allHabitItemIds
    );
    setHabitLogSummarySettings(newSettingsState);
    // updateSettingsInDb(newSettingsState);
  };

  const toggleDeleteSummary = (orderIdToDelete: string) => {
    if (!habitLogSummarySettings) return;

    const newLogSummary = { ...habitLogSummarySettings.logSummary };
    delete newLogSummary[orderIdToDelete];

    const newGlobalLogSummaryDisplayOrder =
      habitLogSummarySettings.globalLogSummaryDisplayOrder.filter(
        (orderId) => orderId !== orderIdToDelete
      );

    const newSettingsState = {
      ...habitLogSummarySettings,
      logSummary: newLogSummary,
      globalLogSummaryDisplayOrder: newGlobalLogSummaryDisplayOrder,
    };
    setHabitLogSummarySettings(newSettingsState);
    // updateSettingsInDb(newSettingsState);
  };

  const toggleSelectHabit = (orderIdToSelectHabit: string) => {
    setSelectingHabitForOrderId(orderIdToSelectHabit);
    setIsSelectHabitModalOpen(true);
  };

  const handleSaveSelectedHabits = (newSelectedIds: number[]) => {
    if (!selectingHabitForOrderId || !habitLogSummarySettings) return;

    const currentSummarySetting =
      habitLogSummarySettings.logSummary[selectingHabitForOrderId];
    if (!currentSummarySetting) return;

    const newSettingsState = {
      ...habitLogSummarySettings,
      logSummary: {
        ...habitLogSummarySettings.logSummary,
        [selectingHabitForOrderId]: {
          ...currentSummarySetting,
          filtersHabitItemIds: newSelectedIds,
        },
      },
    };
    setHabitLogSummarySettings(newSettingsState);
    // updateSettingsInDb(newSettingsState); // DB更新は親のuseEffectに任せる
    setSelectingHabitForOrderId(null); // 編集対象IDをクリア
  };
  const moveSummaryOrder = async (
    orderId: string,
    direction: "up" | "down"
  ) => {
    if (!habitLogSummarySettings) return;

    const currentIndex =
      habitLogSummarySettings.globalLogSummaryDisplayOrder.indexOf(orderId);

    if (currentIndex === -1) return; // Should not happen

    const newOrder = [...habitLogSummarySettings.globalLogSummaryDisplayOrder];
    // console.log("moveSummaryOrder newOrder", newOrder);
    if (direction === "up" && currentIndex > 0) {
      // Swap with the previous element
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
        newOrder[currentIndex],
        newOrder[currentIndex - 1],
      ];
    } else if (direction === "down" && currentIndex < newOrder.length - 1) {
      // Swap with the next element
      [newOrder[currentIndex + 1], newOrder[currentIndex]] = [
        newOrder[currentIndex],
        newOrder[currentIndex + 1],
      ];
    } else {
      return; // Cannot move further in this direction
    }

    const newSettingsState = {
      ...habitLogSummarySettings,
      globalLogSummaryDisplayOrder: newOrder,
    };
    setHabitLogSummarySettings(newSettingsState);
    // updateSettingsInDb(newSettingsState);
  };

  const writeSummaryDetails = (
    orderId: string,
    newName: string,
    newDescription: string
  ) => {
    if (!habitLogSummarySettings) return;
    const currentSummarySetting = habitLogSummarySettings.logSummary[orderId];
    if (!currentSummarySetting) return;

    const newSettingsState = {
      ...habitLogSummarySettings,
      logSummary: {
        ...habitLogSummarySettings.logSummary,
        [orderId]: {
          ...currentSummarySetting,
          name: newName,
          description: newDescription,
        },
      },
    };
    setHabitLogSummarySettings(newSettingsState);
    // updateSettingsInDb(newSettingsState);
  };

  const leafhabitItems = useMemo(() => {
    // console.log("leafhabitItems called ", treeItems);
    return getLeafHabitItems(internalTreeItems, internalHabitItems); // 内部データを使用
  }, [internalTreeItems, internalHabitItems]);

  // DateControls handlers
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setInternalStartDate(date);
    setInternalEndDate(addDays(date, DAY_DIFF));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setInternalEndDate(date);
    setInternalStartDate(subDays(date, DAY_DIFF));
  };

  const goToPreviousRange = () => {
    setInternalStartDate(subDays(internalStartDate, DAY_DIFF + 1));
    setInternalEndDate(subDays(internalEndDate, DAY_DIFF + 1));
  };

  const goToNextRange = () => {
    setInternalStartDate(addDays(internalStartDate, DAY_DIFF + 1));
    setInternalEndDate(addDays(internalEndDate, DAY_DIFF + 1));
  };
  if (habitLogSummarySettings === null) {
    return <div>loading・・・</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">■LogSammary</h2>
        </div>
        <Button variant="outline" size="sm" onClick={toggleAddSummary}>
          <PlusCircle className="mr-2 h-4 w-4" />
          ログサマリ追加
        </Button>
      </div>
      <DateControls
        startDate={internalStartDate}
        endDate={internalEndDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onGoToPreviousRange={goToPreviousRange}
        onGoToNextRange={goToNextRange}
      />
      {habitLogSummarySettings.globalLogSummaryDisplayOrder.map(
        (order, index) => {
          const summarySetting = habitLogSummarySettings.logSummary[order];
          if (!summarySetting) return null; // orderに対応する設定がない場合はスキップ
          return (
            <LogSummaryItem
              key={order}
              summarySetting={summarySetting}
              habitLogs={internalHabitLogs} // 内部のログを使用
              habitItems={internalHabitItems} // 内部のアイテムを使用
              habitItemInfos={internalHabitItemInfos} // 内部のアイテム情報を使用
              startDate={internalStartDate} // 内部の開始日を使用
              endDate={internalEndDate} // 内部の終了日を使用
              onLogClick={onLogClick}
              order={order}
              index={index}
              totalSummaries={
                habitLogSummarySettings.globalLogSummaryDisplayOrder.length
              }
              toggleSummary={toggleSummary}
              moveSummaryOrder={moveSummaryOrder}
              toggleDeleteSummary={toggleDeleteSummary}
              toggleSelectHabit={toggleSelectHabit}
              writeSummaryDetails={writeSummaryDetails}
            />
          );
        }
      )}
      {selectingHabitForOrderId && habitLogSummarySettings && (
        <ModalSelectHabitItems
          isOpen={isSelectHabitModalOpen}
          onOpenChange={setIsSelectHabitModalOpen}
          habitItems={leafhabitItems}
          selectedHabitItemIds={
            habitLogSummarySettings.logSummary[selectingHabitForOrderId]
              ?.filtersHabitItemIds || []
          }
          onSave={handleSaveSelectedHabits}
          summaryName={
            habitLogSummarySettings.logSummary[selectingHabitForOrderId]?.name
          }
        />
      )}
    </>
  );
};

export default LogSummarys;
