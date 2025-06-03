"use client";
import React, { useMemo, useState, useEffect } from "react";
import LogSummaryDaily from "./LogSummaryDaily";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ListFilter,
  Trash,
} from "lucide-react";
import { DbHabitLog } from "@/app/actions/habit_logs";
import { HabitItem, HabitItemInfo } from "@/types/habit/habit_item";
import { Input } from "@/components/ui/input"; // Inputを追加
import { HabitLogSummarySettings } from "@/types/habit/LogSumsSetting";
import { Skeleton } from "@/components/ui/skeleton"; // Skeleton をインポート
import LogSummaryWeeks from "./LogSummaryWeeks";

interface LogSummaryItemProps {
  summarySetting: HabitLogSummarySettings["logSummary"][string];
  habitLogs: DbHabitLog[];
  habitItems: HabitItem[];
  habitItemInfos: HabitItemInfo[];
  startDate: Date;
  endDate: Date;
  onLogClick: (
    log: DbHabitLog,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  order: string;
  index: number;
  totalSummaries: number;
  toggleSummary: (orderId: string) => void;
  moveSummaryOrder: (orderId: string, direction: "up" | "down") => void;
  toggleDeleteSummary: (orderId: string) => void;
  toggleSelectHabit: (orderId: string) => void;
  writeSummaryDetails: (
    orderId: string,
    newName: string,
    newDescription: string
  ) => void;
  onSummaryTypeChange: (orderId: string, newType: string) => void; // ★ タイプ変更ハンドラの型定義
}
const LogSummaryItem: React.FC<LogSummaryItemProps> = ({
  summarySetting,
  habitLogs,
  habitItems,
  habitItemInfos,
  startDate,
  endDate,
  onLogClick,
  order,
  index,
  totalSummaries,
  toggleSummary,
  moveSummaryOrder,
  toggleDeleteSummary,
  toggleSelectHabit,
  writeSummaryDetails,
  onSummaryTypeChange,
}) => {
  const filterIds = summarySetting.filtersHabitItemIds;
  const thisHabitLogsForSummary = useMemo(() => {
    return habitLogs.filter((log) => filterIds.includes(log.item_id));
  }, [habitLogs, filterIds]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(summarySetting.name);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    summarySetting.description
  );

  // summarySettingが変更されたら、編集中の値もリセットする (外部からの変更を反映)
  useEffect(() => {
    setEditedName(summarySetting.name);
  }, [summarySetting.name]);

  useEffect(() => {
    setEditedDescription(summarySetting.description);
  }, [summarySetting.description]);

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleNameBlur = () => {
    if (editedName.trim() === "") {
      setEditedName(summarySetting.name); // 空の場合は元に戻す
    } else {
      writeSummaryDetails(order, editedName, editedDescription);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setEditedName(summarySetting.name);
      setIsEditingName(false);
    }
  };

  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDescription(e.target.value);
  };

  const handleDescriptionBlur = () => {
    // 説明は空でも許可する場合が多いので、トリムのみ
    writeSummaryDetails(order, editedName, editedDescription.trim());
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleDescriptionBlur();
    } else if (e.key === "Escape") {
      setEditedDescription(summarySetting.description);
      setIsEditingDescription(false);
    }
  };
  const isExpanded = summarySetting.isExpanded ?? false;

  return (
    <div key={order} className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSummary(order)}
            className="mr-1 p-1 hover:bg-gray-200 rounded-md"
            aria-expanded={isExpanded}
            aria-controls={`summary-content-${order}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>

          {isEditingName ? (
            <Input
              type="text"
              value={editedName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="text-xl font-bold ml-2 h-9" // スタイル調整
              autoFocus
            />
          ) : (
            <h3
              className="text-xl font-bold ml-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
              onClick={handleNameClick}
            >
              {summarySetting.name}
            </h3>
          )}
          {isEditingDescription ? (
            <Input
              type="text"
              value={editedDescription}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              className="text-sm text-gray-600 ml-2 h-8 sm:block sm:w-64" // スタイル調整
              autoFocus
            />
          ) : (
            <p
              className="text-sm text-gray-600 ml-2 hidden sm:block cursor-pointer hover:bg-gray-100 p-1 rounded"
              onClick={handleDescriptionClick}
            >
              ({summarySetting.description})
            </p>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveSummaryOrder(order, "up")}
            disabled={index === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveSummaryOrder(order, "down")}
            disabled={index === totalSummaries - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSelectHabit(order)}
          >
            <ListFilter className="mr-1 h-3.5 w-3.5" />
            <span className="hidden sm:inline">習慣選択</span>
          </Button>
          <Select
            defaultValue={summarySetting.type}
            onValueChange={(newType) => onSummaryTypeChange(order, newType)} // ★ タイプ変更ハンドラを呼び出す
          >
            <SelectTrigger className="w-[80px] h-9 text-xs">
              <SelectValue placeholder="種類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days" className="text-xs">
                日
              </SelectItem>
              <SelectItem value="weeks" className="text-xs">
                週
              </SelectItem>
              <SelectItem value="table" className="text-xs">
                表
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2"></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleDeleteSummary(order)}
        >
          <Trash className="mr-1 h-3.5 w-3.5" />
          <span className="hidden sm:inline">削除</span>
        </Button>
      </div>

      {isExpanded && (
        <>
          <div id={`summary-content-${order}`}>
            {habitItems.length === 0 ||
            (filterIds.length > 0 && thisHabitLogsForSummary.length === 0) ? (
              <div className="p-4">
                {filterIds.length > 0 &&
                thisHabitLogsForSummary.length === 0 &&
                habitItems.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    選択された習慣のログは期間内にありません。
                  </p>
                ) : (
                  <>
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-20 w-full" />
                  </>
                )}
              </div>
            ) : summarySetting.type === "days" ||
              summarySetting.type === "1day" ? (
              <LogSummaryDaily
                habitItems={habitItems}
                habitItemInfos={habitItemInfos}
                habitLogs={thisHabitLogsForSummary}
                startDate={startDate}
                endDate={endDate}
                onLogClick={onLogClick}
              />
            ) : summarySetting.type === "weeks" ? (
              <LogSummaryWeeks
                habitItems={habitItems}
                habitItemInfos={habitItemInfos}
                habitLogs={thisHabitLogsForSummary}
                startDate={startDate}
                onLogClick={onLogClick}
              />
            ) : summarySetting.type === "table" ? (
              // TODO: "table" タイプの場合のコンポーネントをここに実装
              <div className="p-4 text-center text-muted-foreground border-2">
                テーブル表示は準備中です。
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
export default LogSummaryItem;
