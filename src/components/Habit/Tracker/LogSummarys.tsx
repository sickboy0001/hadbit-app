"use client";

import React, { useMemo, useState } from "react";
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

interface LogSummarysProps {
  habitItems: HabitItem[];
  habitLogs: DbHabitLog[];
  treeItems: TreeItem[];
  habitItemInfos: HabitItemInfo[];
  startDate: Date;
  endDate: Date;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  habitLogSummarySettings: HabitLogSummarySettings | null;
  setHabitLogSummarySettings: React.Dispatch<
    React.SetStateAction<HabitLogSummarySettings | null>
  >;
  // updateSettingsInDb: (
  //   // 親コンポーネントから渡されるDB更新関数
  //   updatedSettings: HabitLogSummarySettings | null
  // ) => Promise<void>;
}

const LogSummarys: React.FC<LogSummarysProps> = ({
  habitItems,
  habitLogs,
  treeItems,
  habitItemInfos = [],
  startDate,
  endDate,
  onLogClick,
  habitLogSummarySettings,
  setHabitLogSummarySettings,
  // updateSettingsInDb, // Propsとして受け取る
}) => {
  const [isSelectHabitModalOpen, setIsSelectHabitModalOpen] = useState(false);
  const [selectingHabitForOrderId, setSelectingHabitForOrderId] = useState<
    string | null
  >(null);

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
    if (!habitLogSummarySettings && habitItems.length === 0) {
      // 初期化もできない場合は何もしない（またはエラー表示）
      console.warn(
        "Cannot add summary: initial settings and habit items are not available."
      );
      return;
    }
    const newOrderId = String(crypto.randomUUID());
    const allHabitItemIds = habitItems.map((item) => item.id);
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
    console.log("leafhabitItems called ", treeItems);
    return getLeafHabitItems(treeItems, habitItems);
  }, [treeItems, habitItems]);

  if (habitLogSummarySettings === null) {
    return <div>loading・・・</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">■記録（サマリ）</h2>
        <Button variant="outline" size="sm" onClick={toggleAddSummary}>
          <PlusCircle className="mr-2 h-4 w-4" />
          ログサマリ追加
        </Button>
      </div>
      {habitLogSummarySettings.globalLogSummaryDisplayOrder.map(
        (order, index) => {
          const summarySetting = habitLogSummarySettings.logSummary[order];
          if (!summarySetting) return null; // orderに対応する設定がない場合はスキップ
          return (
            <LogSummaryItem
              key={order}
              summarySetting={summarySetting}
              habitLogs={habitLogs}
              habitItems={habitItems}
              habitItemInfos={habitItemInfos}
              startDate={startDate}
              endDate={endDate}
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
