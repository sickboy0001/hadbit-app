"use client";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { toast } from "sonner"; // Toasts (通知) ライブラリ
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, isValid, parse, startOfDay } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  readHabitItems,
  readHabitItemTreeWithUserId,
} from "@/app/actions/habit_items";
// import { HabitItem } from "@/types/habit/habit_item";
import { HabitItem, HabitItemTree } from "@/types/habit/habit_item"; // HabitItemTree をインポート
import { ja } from "date-fns/locale/ja";
import {
  DbHabitLogInsert,
  importHabitLogsFromServer,
  ImportMode,
} from "@/app/actions/habit_logs";

// 階層表示用の習慣アイテムの型
interface HabitItemWithDisplayNameSort extends HabitItem {
  hierarchicalName: string;
  sortkey: string;
}

interface ParsedLogEntry {
  date: Date; // 解析された日付オブジェクト
  comment?: string; // コメント (オプショナル)
  originalLine: string; // CSVの元の行データ
  lineNumber: number; // CSVの行番号
}

export default function HabitLogImportPage() {
  const [displayHabits, setDisplayHabits] = useState<
    HabitItemWithDisplayNameSort[]
  >([]); // 表示用の習慣リスト
  const [selectedHabitId, setSelectedHabitId] = useState<string>(""); // 選択された習慣のID
  const [csvText, setCsvText] = useState<string>(""); // 入力されたCSVテキスト
  const [importMode, setImportMode] = useState<ImportMode>("deleteAndRegister"); // インポートモード

  const [parsedCsvData, setParsedCsvData] = useState<ParsedLogEntry[]>([]); // 解析されたCSVデータ
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false); // 確認ダイアログの表示状態
  const [isProcessing, startTransition] = useTransition(); // 処理中の状態管理 (UIのブロッキングを防ぐ)
  const [formError, setFormError] = useState<string | null>(null); // フォーム全体のエラーメッセージ
  const { user, loading: authLoading } = useAuth(); // ★ 認証状態を取得

  // HabitItemTree と HabitItem[] から階層的な習慣リストを生成する関数
  const buildHierarchicalHabitList = (
    items: HabitItem[],
    treeNodes: HabitItemTree[]
  ): HabitItemWithDisplayNameSort[] => {
    const list: HabitItemWithDisplayNameSort[] = [];
    // 親を遡って階層的な名前を構築するヘルパー関数
    const getHierarchicalName = (
      itemId: number,
      currentTreeNodes: HabitItemTree[],
      allItems: HabitItem[]
    ): string => {
      const currentTreeNode = currentTreeNodes.find(
        (tn) => tn.item_id === itemId
      );
      const currentItem = allItems.find((item) => item.id === itemId);

      if (!currentTreeNode || !currentItem) return ""; // アイテムが見つからない場合は空文字

      if (currentTreeNode.parent_id && currentTreeNode.parent_id !== 0) {
        // parent_id が 0 の場合はトップレベルとみなす
        const parentName = getHierarchicalName(
          currentTreeNode.parent_id,
          currentTreeNodes,
          allItems
        );
        return parentName
          ? `${parentName} > ${currentItem.name}`
          : currentItem.name;
      } else {
        return currentItem.name;
      }
    };
    const getHierarchicalOrder = (
      itemId: number,
      currentTreeNodes: HabitItemTree[],
      // allItems: HabitItem[] // HabitItemはorder_noを持たないので不要
      _allItemsPlaceholder?: HabitItem[] // 引数の互換性のために残すが、実際には使わない
    ): string => {
      const currentTreeNode = currentTreeNodes.find(
        (tn) => tn.item_id === itemId
      );

      if (!currentTreeNode) return ""; // ノードが見つからない場合は空文字

      // order_no を3桁のゼロ埋め文字列に変換（例: 1 -> "001", 10 -> "010"）
      // order_no が null の場合はデフォルト値（例: "999" や index）を使うことも検討できますが、
      // ここでは order_no が存在することを前提とします。もし null の可能性がある場合は、
      // (currentTreeNode.order_no ?? 999) のようにフォールバック値を設定してください。
      const currentOrderStr = String(currentTreeNode.order_no ?? 0).padStart(
        3,
        "0"
      );

      if (currentTreeNode.parent_id && currentTreeNode.parent_id !== 0) {
        const parentOrder = getHierarchicalOrder(
          currentTreeNode.parent_id,
          currentTreeNodes,
          _allItemsPlaceholder
        );
        return `${parentOrder}${currentOrderStr}_`;
      } else {
        return `${currentOrderStr}_`;
      }
    };

    treeNodes.forEach((currentNode) => {
      // currentNodeが葉ノードであるか（子を持たないか）を確認します。
      // childrenプロパティが存在しない、または空の配列の場合に葉ノードと判断します。
      const isLeafNode = !treeNodes.some(
        (node) => node.parent_id === currentNode.item_id
      );
      if (isLeafNode) {
        // 葉ノードの場合、対応するHabitItemをitems配列から見つけてリストに追加します。

        const correspondingItem = items.find(
          (item) => item.id === currentNode.item_id
        );
        if (correspondingItem) {
          // 階層名を生成して、新しいオブジェクトとしてリストに追加
          const hierarchicalName = getHierarchicalName(
            currentNode.item_id,
            treeNodes,
            items
          );
          const hierarchicalOrder = getHierarchicalOrder(
            currentNode.item_id,
            treeNodes,
            items
          );
          list.push({
            ...correspondingItem,
            hierarchicalName: hierarchicalName, // name プロパティを階層名で上書き
            sortkey: hierarchicalOrder,
          });
        }
      }
    });
    console.log("list", list);

    return list;
  };

  // const router = useRouter(); // Next.jsのルーター
  // ページロード時にユーザーの習慣リストを読み込む
  useEffect(() => {
    if (user && user.userid) {
      const userId = user.userid;
      const loadHabits = async () => {
        try {
          const rawHabitItems = await readHabitItems(userId);
          const habitTree = await readHabitItemTreeWithUserId(userId);
          const hierarchicalList = buildHierarchicalHabitList(
            rawHabitItems,
            habitTree
          );
          console.log("hierarchicalList", hierarchicalList);
          // setDisplayHabits(hierarchicalList);
          setDisplayHabits(
            hierarchicalList.sort((a, b) => a.sortkey.localeCompare(b.sortkey))
          ); // sortkeyで最終ソート
        } catch (error) {
          console.error("習慣リストの読み込みに失敗しました:", error);
          toast.error("習慣リストの読み込みに失敗しました。");
        }
      };
      loadHabits();
    } else {
      setDisplayHabits([]); // ユーザーがいない場合はリストをクリア
    }
  }, [user]); // user オブジェクトの変更を検知

  if (authLoading) {
    return <div>読み込み中...</div>;
  }
  // 「確認画面へ進む」ボタンの処理
  const handleProceedToConfirmation = () => {
    setFormError(null); // エラーメッセージをリセット
    if (!selectedHabitId) {
      setFormError("対象の習慣を選択してください。");
      return;
    }
    if (!csvText.trim()) {
      setFormError("CSVデータを入力してください。");
      return;
    }

    const lines = csvText.trim().split(/\r?\n/); // 改行コード (LF, CRLF) で行分割
    const parsed: ParsedLogEntry[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // 空行はスキップ

      const parts = trimmedLine.split(","); // 最初のカンマで分割
      const dateStr = parts[0]?.trim();
      const comment =
        parts.length > 1 ? parts.slice(1).join(",").trim() : undefined; // 2つ目以降のカンマはコメントの一部として扱う

      if (!dateStr) {
        errors.push(`行 ${lineNumber}: 日付が空です。 (${trimmedLine})`);
        return;
      }

      // 'yyyy/M/d' 形式で日付をパース (例: 2023/1/5, 2023/12/15)
      const parsedDate = parse(dateStr, "yyyy/M/d", new Date());
      if (!isValid(parsedDate)) {
        errors.push(
          `行 ${lineNumber}: 日付の形式が無効です ("${dateStr}")。YYYY/M/D 形式で入力してください。`
        );
        return;
      }
      // 日付を日の始まりに正規化して保存
      parsed.push({
        date: startOfDay(parsedDate),
        comment,
        originalLine: trimmedLine,
        lineNumber,
      });
    });

    if (errors.length > 0) {
      setFormError(`CSVデータの解析エラー:\n${errors.join("\n")}`);
      setParsedCsvData([]);
      return;
    }

    if (parsed.length === 0) {
      setFormError("有効なログデータがCSVに見つかりませんでした。");
      setParsedCsvData([]);
      return;
    }

    setParsedCsvData(parsed);
    setShowConfirmation(true); // 確認ダイアログを表示
  };

  // インポート実行の最終確認後の処理
  const handleConfirmImport = () => {
    if (!selectedHabitId || parsedCsvData.length === 0) return;
    if (!user) return;
    if (!user.userid) return;

    const userId = user.userid;

    // DB登録用のデータ形式に変換
    const logsToInsert: DbHabitLogInsert[] = parsedCsvData.map((log) => ({
      item_id: selectedHabitId, // 選択された習慣のID (DBスキーマの型に合わせる string or number)
      done_at: log.date, // Dateオブジェクト。サーバー側でISO文字列やDBのdatetime型に変換
      comment: log.comment || null, // commentがundefinedならnullをDBへ
      user_id: userId,

      // s はサーバーアクション側で認証情報から付与する
    }));
    console.log("start HandleConfirmImport called with ", logsToInsert);
    startTransition(async () => {
      // 非同期処理をトランジション内で実行
      try {
        const result = await importHabitLogsFromServer(
          selectedHabitId,
          logsToInsert,
          importMode
        );
        if (result.success) {
          toast.success(result.message || "ログのインポートに成功しました。");
          setShowConfirmation(false);
          setCsvText(""); // フォームをリセット
          setParsedCsvData([]);
          // 必要に応じて、インポート後に特定のページに遷移したり、データを再読み込みしたりする
          // router.push('/habits');
        } else {
          toast.error(result.message || "ログのインポートに失敗しました。");
        }
      } catch (error: unknown) {
        console.error("インポート処理に失敗しました:", error);
        let errorMessage = "不明なエラー";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(`インポート処理中にエラーが発生しました: ${errorMessage}`);
      }
    });
  };

  const selectedHabitName =
    displayHabits.find((h) => String(h.id) === selectedHabitId)
      ?.hierarchicalName || "未選択";
  const importModeText =
    importMode === "deleteAndRegister"
      ? "削除後登録 (CSV内の日付に該当する既存ログを削除し、新しいログを登録)"
      : "削除なしで登録 (既存ログを保持し、新しいログを追加登録)";

  return (
    <>
      <div className="container mx-auto p-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          習慣ログ CSVインポート
        </h1>

        <div className="space-y-6 bg-white p-6 shadow-lg rounded-lg">
          {/* 1. 対象の習慣選択 */}
          <div>
            <Label htmlFor="habit-select" className="text-lg font-medium">
              1. 対象の習慣
            </Label>
            <Select
              value={selectedHabitId}
              onValueChange={setSelectedHabitId}
              name="habitId"
            >
              <SelectTrigger id="habit-select" className="mt-1">
                <SelectValue placeholder="習慣を選択してください..." />
              </SelectTrigger>
              <SelectContent>
                {displayHabits.length === 0 && (
                  <SelectItem value="loading" disabled>
                    読み込み中...
                  </SelectItem>
                )}
                {displayHabits.map((habit) => (
                  <SelectItem key={habit.id} value={String(habit.id)}>
                    {habit.hierarchicalName} {/* 表示は階層名 */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. CSVデータ入力 */}
          <div>
            <Label htmlFor="csv-input" className="text-lg font-medium">
              2. CSVデータ入力
            </Label>
            <Textarea
              id="csv-input"
              value={csvText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setCsvText(e.target.value)
              }
              placeholder={
                "例:\n2025/1/2,コメントありの記録\n2025/2/2\n2025/3/2,別のコメント"
              }
              rows={10}
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              各行に「日付,コメント」の形式で入力。コメントは省略可能です。日付は「YYYY/M/D」形式。
            </p>
          </div>

          {/* 3. 登録オプション */}
          <div>
            <Label className="text-lg font-medium">3. 登録オプション</Label>
            <RadioGroup
              value={importMode}
              onValueChange={(value) => setImportMode(value as ImportMode)}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-slate-50">
                <RadioGroupItem value="registerOnly" id="mode-register" />
                <Label
                  htmlFor="mode-register"
                  className="font-normal cursor-pointer"
                >
                  削除なしで登録 (既存ログを保持し、新しいログを追加)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-slate-50">
                <RadioGroupItem value="deleteAndRegister" id="mode-delete" />
                <Label
                  htmlFor="mode-delete"
                  className="font-normal cursor-pointer"
                >
                  削除後登録
                  (CSV内の日付に該当する既存ログを削除し、新しいログを登録)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* エラーメッセージ表示 */}
          {formError && (
            <div className="text-red-600 bg-red-50 p-3 rounded-md whitespace-pre-wrap text-sm">
              {formError}
            </div>
          )}

          {/* 確認画面へ進むボタン */}
          <Button
            onClick={handleProceedToConfirmation}
            disabled={isProcessing || !selectedHabitId || !csvText.trim()}
            className="w-full text-lg py-3"
          >
            確認画面へ進む
          </Button>
        </div>

        {/* インポート内容確認ダイアログ */}
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>インポート内容の確認</AlertDialogTitle>
              <AlertDialogDescription>
                以下の内容で習慣ログをインポートします。よろしいですか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 space-y-3 text-sm max-h-80 overflow-y-auto">
              <p>
                <strong>対象の習慣:</strong> {selectedHabitName}
              </p>
              <p>
                <strong>登録モード:</strong> {importModeText}
              </p>
              <p>
                <strong>インポート件数:</strong> {parsedCsvData.length}件
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600 hover:underline">
                  プレビュー (最初の最大10件表示)
                </summary>
                <ul className="list-disc list-inside pl-4 mt-1 bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                  {parsedCsvData.slice(0, 10).map((log, index) => (
                    <li key={index} className="font-mono text-xs py-0.5">
                      {format(log.date, "yyyy/MM/dd", { locale: ja })}
                      {log.comment ? `, ${log.comment}` : ""}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
              >
                キャンセル
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmImport}
                disabled={isProcessing}
              >
                {isProcessing ? "処理中..." : "OK (インポート実行)"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
