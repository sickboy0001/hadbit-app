"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import DialogEdit from "@/components/molecules/DialogEdit"; // DialogEdit をインポート
import { format, addDays, startOfDay, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner"; // sonner から toast をインポート

import { TreeItem } from "@/types/habit/ui";
import { HabitItem } from "@/types/habit/habit_item";
import { useAuth } from "@/contexts/AuthContext";
import { buildTreeFromHabitAndParentReration } from "@/util/treeConverter";

import { DbHabitLog } from "@/app/actions/habit_logs";
import { parseISO } from "date-fns/parseISO"; // ★ parseISO をインポート
import ConfirmationDialog from "@/components/molecules/ConfirmationDialog"; // ★ ConfirmationDialog をインポート

import ModalDbHabitLogEditForm from "../organisms/ModalDbHabitLogEditForm";
import TreeHabitSelection from "./TreeHabitSelection"; // 新しいツリービューコンポーネントをインポート

import { TypeHeatMapData } from "@/types/TypeHeatMap";

import HeatMapTableHabitLog from "./HeatMapTableHabitLog";
import {
  deleteHabitLogByIdEntry,
  fetchHabitDataForUI,
  fetchSortedHabitLogs,
  updateHabitLogEntry,
} from "../ClientApi/HabitLogClientApi";
import { DAY_DEF_HABIT_DONE } from "@/constants/dateConstants"; // 定数をインポート
import DateControls from "./DateControls";

// const START_DATE_SHIFT_DAYS = 3; // ★ 開始日を今日から何日後にするか

export default function HabitDone() {
  const [, startTransition] = useTransition(); // ★ トランジションフック
  const [habitItems, setHabitItems] = useState<HabitItem[]>([]);
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]); // ★ 初期値を空配列に変更
  const { user, loading: authLoading } = useAuth(); // ★ 認証状態を取得

  const [readHabitlogs, setReadHabitLogs] = useState<DbHabitLog[]>([]);
  const [selHabitlogs, setSelHabitLogs] = useState<DbHabitLog[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<DbHabitLog | null>(null);
  const [activeHeatMap, setActiveHeatMap] = useState<TypeHeatMapData[]>([]);

  const defaultEndDate = useMemo(() => {
    return startOfDay(new Date()); // ★ デフォルトの終了日は常に「今日の0時」
  }, []);

  // ★ defaultStartDate と defaultEndDate を useMemo でメモ化
  const defaultStartDate = useMemo(() => {
    // defaultEndDate から DAY_DEF_HABIT_DONE - 1 日前を計算
    return subDays(defaultEndDate, DAY_DEF_HABIT_DONE - 1);
  }, [defaultEndDate]); // defaultEndDate に依存するように変更

  const [internalStartDate, setInternalStartDate] = useState(defaultStartDate);
  const [internalEndDate, setInternalEndDate] = useState(defaultEndDate);

  // --- 編集ダイアログ関連の状態 ---
  const [isLogEditDialogOpen, setIsLogEditDialogOpen] = useState(false);
  const [editingLogData, setEditingLogData] = useState<DbHabitLog | null>(null);

  // ダイアログ内で編集中の日付とコメントを管理するstate
  const [, setEditedDateInDialog] = useState<Date | undefined>(undefined);
  const [, setEditedCommentInDialog] = useState<string>("");
  const refreshItems = useCallback(() => {
    if (!user?.userid) return; // ユーザーIDがない場合は何もしない
    // if (user === undefined) return; // ユーザーIDがない場合は何もしない
    const userId = user.userid;
    startTransition(async () => {
      try {
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
        toast.error("リストの読み込みに失敗しました。");
        console.error("Failed to fetch habit items:", error);
      }
    });
  }, [user, startTransition]); // user と startTransition に依存

  // DateControls handlers
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    const newStartDate = startOfDay(date);
    setInternalStartDate(newStartDate);
    setInternalEndDate(addDays(newStartDate, DAY_DEF_HABIT_DONE - 1)); // 期間を DAY_DEF_HABIT_DONE 日間に維持
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    const newEndDate = startOfDay(date);
    setInternalEndDate(newEndDate);
    setInternalStartDate(subDays(newEndDate, DAY_DEF_HABIT_DONE - 1)); // 期間を DAY_DEF_HABIT_DONE 日間に維持
  };

  const goToPreviousRange = () => {
    setInternalStartDate(
      subDays(internalStartDate, Number(DAY_DEF_HABIT_DONE / 2))
    );
    setInternalEndDate(
      subDays(internalEndDate, Number(DAY_DEF_HABIT_DONE / 2))
    );
  };

  const goToNextRange = () => {
    setInternalStartDate(
      addDays(internalStartDate, Number(DAY_DEF_HABIT_DONE / 2))
    );
    setInternalEndDate(
      addDays(internalEndDate, Number(DAY_DEF_HABIT_DONE / 2))
    );
  };

  const refreshHabitLogs = useCallback(async () => {
    if (!user?.userid) return; // ユーザーIDがない場合は何もしない
    if (user === undefined) return; // ユーザーIDがない場合は何もしない
    const userId = user.userid;
    // startDate と endDate を YYYY-MM-DD 形式の文字列に変換
    const formattedStartDate = format(internalStartDate, "yyyy-MM-dd");
    const formattedEndDate = format(internalEndDate, "yyyy-MM-dd");

    startTransition(async () => {
      try {
        const sortedLogs = await fetchSortedHabitLogs(
          userId,
          formattedStartDate,
          formattedEndDate
        );
        setReadHabitLogs(sortedLogs);
        // console.log("habitlogs", sortedLogs);
      } catch (error) {
        toast.error("習慣記録の読み込みに失敗しました。");
        console.error("Failed to fetch habit logs:", error);
      }
    });
  }, [user, startTransition, internalStartDate, internalEndDate]); // ★ defaultStartDate と defaultEndDate を追加

  useEffect(() => {
    if (user?.userid) {
      refreshItems();
    }
  }, [user?.userid, refreshItems]); // refreshItems も依存配列に追加

  useEffect(() => {
    if (user?.userid) {
      refreshHabitLogs();
    }
  }, [user?.userid, internalStartDate, internalEndDate, refreshHabitLogs]); // ★ user?.userid を追加

  // item_id (number) から習慣名 (string) を取得するヘルパー関数
  const getHabitItemNameById = useCallback(
    (itemId: number): string => {
      const foundHabitItem = habitItems.find((item) => item.id === itemId);
      return foundHabitItem ? foundHabitItem.name : "不明な習慣";
    },
    [habitItems] // habits state が変更されたら再生成
  );

  // readHabitlogs が更新されたら、selHabitlogs も全件で初期化（「全て」選択時の状態）
  useEffect(() => {
    setSelHabitLogs(readHabitlogs);
  }, [readHabitlogs]);

  const toggleHabitSelection = useCallback(
    async (habitId: string, habitName: string) => {
      console.log(
        "toggleHabitSelection called habitId, habitName",
        habitId,
        habitName
      );
      const selectedId = Number(habitId);
      if (selectedId == 0) {
        setSelHabitLogs(readHabitlogs);
      } else {
        // 特定の習慣が選択された場合
        const filteredLogs = readHabitlogs.filter(
          (log) => log.item_id === selectedId
        );
        setSelHabitLogs(filteredLogs);
      }
    },
    [readHabitlogs] // readHabitlogs に依存
  );

  useEffect(() => {
    if (!selHabitlogs) {
      setActiveHeatMap([]);
      return;
    }

    const countsByDate: Record<string, number> = {};

    selHabitlogs.forEach((log) => {
      try {
        const dateObj = parseISO(log.done_at); // ISO文字列をDateオブジェクトにパース
        // @uiw/react-heat-map が期待する形式 "yyyy/MM/dd" にフォーマット
        const formattedDateKey = format(dateObj, "yyyy/MM/dd");
        countsByDate[formattedDateKey] =
          (countsByDate[formattedDateKey] || 0) + 1;
      } catch (error) {
        console.error("ヒートマップ用の日付パースエラー:", log.done_at, error);
      }
    });

    const newHeatMapData = Object.entries(countsByDate).map(
      ([date, count]) => ({ date, count })
    );
    setActiveHeatMap(newHeatMapData);
  }, [selHabitlogs]);

  const handleDialogClose = (open: boolean) => {
    setIsLogEditDialogOpen(open);
    if (!open) {
      setEditingLogData(null);
      setEditedDateInDialog(undefined);
      setEditedCommentInDialog("");
    }
  };

  const handleSaveLogEdit = useCallback(async () => {
    console.log("handleSaveLogEdit called editingLogData:", editingLogData);
    if (!editingLogData) {
      toast.error("保存に必要な情報が不足しています。");
      return;
    }
    if (!user?.userid) {
      toast.error("ユーザー情報が見つかりません。");
      return;
    }

    // editingLogData (DbHabitLog型) から必要な情報を取得
    const { id: logIdToUpdate, item_id } = editingLogData;
    const habitName = getHabitItemNameById(item_id); // 習慣名を取得

    startTransition(async () => {
      try {
        const updatedLog = await updateHabitLogEntry(
          // ★ DAO関数を呼び出し
          logIdToUpdate,
          editingLogData.done_at,
          editingLogData.comment || ""
        );
        if (updatedLog) {
          toast.success(`「${habitName}」の記録を更新しました。`, {
            description: `${format(editingLogData.done_at, "yyyy年M月d日", {
              locale: ja,
            })}${
              editingLogData.comment
                ? ` - ${editingLogData.comment.substring(0, 20)}...`
                : ""
            }`,
          });
        } else {
          toast.error("記録の更新に失敗しました。");
        }
      } catch (error) {
        console.error("Failed to save habit log edit:", error);
        const errorMessage =
          error instanceof Error ? error.message : "不明なエラー";
        toast.error(`記録の更新中にエラーが発生しました: ${errorMessage}`);
      } finally {
        // 成功・失敗に関わらず、UIを最新の状態に同期し、ダイアログを閉じる
        await refreshHabitLogs();
        setIsLogEditDialogOpen(false);
        setEditingLogData(null);
        setEditedDateInDialog(undefined);
        setEditedCommentInDialog("");
      }
    });
  }, [
    editingLogData,
    user,
    refreshHabitLogs,
    startTransition,
    getHabitItemNameById,
  ]);

  const handleOpenLogEditDialog = (logToEdit: DbHabitLog) => {
    console.log("[HabitDone] Opening edit dialog for log:", logToEdit);
    setEditingLogData(logToEdit); // 編集対象のログオブジェクト全体をセット
    // ダイアログの初期値をセット
    setEditedDateInDialog(startOfDay(parseISO(logToEdit.done_at)));
    setEditedCommentInDialog(logToEdit.comment || "");
    setIsLogEditDialogOpen(true); // ダイアログを開く
  };

  const handleOpenDeleteDialog = (log: DbHabitLog) => {
    setLogToDelete(log);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!logToDelete || !user?.userid) {
      toast.error("削除対象の記録またはユーザー情報が見つかりません。");
      setIsDeleteDialogOpen(false);
      return;
    }

    const userId = user.userid;
    const { id: logIdToDelete, item_id, done_at } = logToDelete; // ★ logIdToDelete を取得
    const habitName = getHabitItemNameById(item_id);

    startTransition(async () => {
      try {
        // deleteHabitLog 関数を呼び出す (HabitTracker.tsx からインポートまたは同様の関数を定義)
        // この関数は userId, itemId, formattedDate を引数に取る想定
        // const success = await deleteDayHabitLogEntry(
        //   userId,
        //   item_id,
        //   formattedDate
        // ); // ★ DAO関数を呼び出し
        // deleteHabitLogByIdEntry を使用して、ログIDで直接削除
        const success = await deleteHabitLogByIdEntry(
          // ★ こちらの関数を使用
          userId,
          logIdToDelete // ★ ログのIDを渡す
        ); // ★ DAO関数を呼び出し

        if (success) {
          toast.success(`「${habitName}」の記録を削除しました。`, {
            description: `${format(parseISO(done_at), "yyyy年M月d日", {
              locale: ja,
            })}`,
          });
          await refreshHabitLogs();
        } else {
          toast.error("記録の削除に失敗しました。");
        }
      } catch (error) {
        console.error("Failed to delete habit log:", error);
        toast.error("記録の削除中にエラーが発生しました。");
      } finally {
        setIsDeleteDialogOpen(false);
        setLogToDelete(null);
      }
    });
  }, [
    logToDelete,
    user,
    refreshHabitLogs,
    startTransition,
    getHabitItemNameById,
  ]);
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setLogToDelete(null);
  };
  if (authLoading || (user?.userid && treeItems.length === 0)) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }

  //ActiveHeatMap
  // const to_at = new Date(defaultEndDate);
  // const from_at = addDays(to_at, -365);

  return (
    <div className="space-y-6">
      {/* DialogEdit を使用して編集ダイアログをレンダリング */}
      {editingLogData && ( // editingLogData がある場合のみ DialogEdit をレンダリング（タイトル設定のため）
        <DialogEdit
          open={isLogEditDialogOpen}
          onOpenChange={handleDialogClose}
          // 編集。editingLogData.item_id から習慣名を取得
          title={`「${
            editingLogData ? getHabitItemNameById(editingLogData.item_id) : ""
          }」の記録を編集`}
          onSave={handleSaveLogEdit}
        >
          <ModalDbHabitLogEditForm
            dbHabitlog={editingLogData}
            setDbHabitlog={setEditingLogData}
          />
        </DialogEdit>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[theme(spacing.72)_1fr] gap-6">
        {/* 左側のカラム: 習慣選択ツリー */}
        <TreeHabitSelection
          treeItems={treeItems}
          onHabitSelect={toggleHabitSelection}
        />
        <div>
          <div>
            <h2 className="text-xl font-semibold"> ■Recorded（1year）</h2>
          </div>

          <DateControls
            startDate={internalStartDate}
            endDate={internalEndDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onGoToPreviousRange={goToPreviousRange}
            onGoToNextRange={goToNextRange}
          />
          <HeatMapTableHabitLog
            activeHeatMap={activeHeatMap}
            fromAtString={format(internalStartDate, "yyyy-MM-dd")}
            toAtString={format(addDays(internalEndDate, 1), "yyyy-MM-dd")} // endDateを1日進めて、今日の日付が含まれるようにする
            selHabitlogs={selHabitlogs}
            getHabitItemNameById={getHabitItemNameById}
            handleOpenLogEditDialog={handleOpenLogEditDialog} // 関数名を props 名に合わせる
            handleOpenDeleteDialog={handleOpenDeleteDialog}
          />
        </div>
      </div>

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
        // 必要に応じて ConfirmationDialog に destructive スタイルを適用するための prop を追加
        // confirmButtonVariant="destructive" // 例: ConfirmationDialog がこのような prop を受け付ける場合
      />
    </div>
  );
}
