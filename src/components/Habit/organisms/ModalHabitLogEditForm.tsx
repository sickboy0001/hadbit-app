"use client";
import React, { useState, useEffect, useRef } from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale"; // 日本語表示のため
import { cn } from "@/lib/utils"; // Shadcn UIのユーティリティ

// Interface for the function returned by customDebounce
interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

// 自作の debounce 関数 (型定義を修正)
function customDebounce<Args extends unknown[]>(
  func: (...args: Args) => unknown, // The original function can return anything

  waitFor: number
): DebouncedFunction<Args> {
  // 戻り値の型をより正確に
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Args): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), waitFor);
  };

  debounced.cancel = (): void => {
    // オプショナル: debounceをキャンセルするメソッド
    if (timeoutId !== null) clearTimeout(timeoutId);
  };
  return debounced;
}

interface ModalHabitLogEditFormProps {
  currentDate: Date | undefined; // 表示する日付
  comment: string; // 表示するコメント
  onDateChange: (date: Date | undefined) => void; // 日付が変更されたときのコールバック
  onCommentChange: (comment: string) => void; // コメントが変更されたときのコールバック
}

const ModalHabitLogEditForm: React.FC<ModalHabitLogEditFormProps> = ({
  currentDate,
  comment,
  onDateChange,
  onCommentChange,
}) => {
  // console.log("[ModalHabitLogEditForm] Rendered with props:", {
  //   currentDate,
  //   comment,
  // });
  // 内部でコメントを管理するための state
  const [internalComment, setInternalComment] = useState<string>(comment);

  // onCommentChange が変更された場合に最新のものを参照するための ref
  const latestOnCommentChangeRef = useRef(onCommentChange);
  useEffect(() => {
    latestOnCommentChangeRef.current = onCommentChange;
  }, [onCommentChange]);

  // onCommentChange をデバウンスする関数 (例: 300ms の遅延)
  // useRef を使って debounce 関数自体は再生成されないようにする
  // customDebounce のコールバック内で最新の onCommentChange を使用
  const debouncedFuncRef = useRef(
    customDebounce((newComment: string) => {
      latestOnCommentChangeRef.current(newComment);
    }, 300)
  );

  // internalComment が変更されたら、デバウンスされた onCommentChange を呼び出す
  useEffect(() => {
    const debouncedCall = debouncedFuncRef.current;
    // クリーンアップ関数
    return () => {
      debouncedCall.cancel(); // キャプチャした debouncedCall の cancel を呼び出す
    };
  }, [internalComment, comment]); // 依存配列を修正: onCommentChange は latestOnCommentChangeRef で処理

  // props.comment が外部から変更された場合、internalComment も更新する
  useEffect(() => {
    setInternalComment(comment);
  }, [comment]);

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="date-picker-trigger" className="text-right col-span-1">
          日付11
        </Label>
        {/* Shadcn UI DatePickerコンポーネントを使用 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date-picker-trigger"
              variant={"outline"}
              className={cn(
                "col-span-3 justify-start text-left font-normal",
                !currentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {currentDate ? (
                format(currentDate, "PPP", { locale: ja })
              ) : (
                <span>日付を選択</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="log-comment" className="text-right">
          コメント
        </Label>
        <Textarea
          id="log-comment"
          value={internalComment} // 内部 state を value に設定
          onChange={(e) => setInternalComment(e.target.value)} // 内部 state を更新
          className="col-span-3"
          placeholder="コメントを入力 (任意)"
        />
      </div>
    </div>
  );
};

export default ModalHabitLogEditForm;
