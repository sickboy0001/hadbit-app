"use client";
import React, { useState } from "react";

// import { DatePicker } from "@/components/ui/date-picker"; // DatePicker をインポート
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DbHabitLog } from "@/app/actions/habit_logs";
import { format } from "date-fns"; // ★ format, parseISO, startOfDay をインポート
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ja } from "date-fns/locale/ja";

interface ModalDbHabitLogEditFormProps {
  dbHabitlog: DbHabitLog;
  setDbHabitlog: (value: DbHabitLog) => void;
}

const ModalDbHabitLogEditForm: React.FC<ModalDbHabitLogEditFormProps> = ({
  dbHabitlog,
  setDbHabitlog,
}) => {
  const [comment, setComment] = useState<string>(
    dbHabitlog.comment?.trim() || ""
  );
  const [doneAt, setDoneAt] = useState<Date>(new Date(dbHabitlog.done_at));

  const setCommentLocal = (value: string) => {
    setComment(value);
    setDbHabitlog({ ...dbHabitlog, comment: value });
  };
  const setDoneAtLocal = (date: Date | undefined) => {
    if (date !== undefined) {
      setDoneAt(date);
      setDbHabitlog({ ...dbHabitlog, done_at: format(date, "yyyy-MM-dd") });
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="log-date" className="text-right">
          日付１１１
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date-picker-trigger"
              variant={"outline"}
              className={cn(
                "col-span-3 justify-start text-left font-normal",
                !doneAt && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {doneAt ? (
                format(doneAt, "PPP", { locale: ja })
              ) : (
                <span>日付を選択</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={doneAt}
              onSelect={setDoneAtLocal}
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
          value={comment} // 内部 state を value に設定
          onChange={(e) => setCommentLocal(e.target.value)} // 内部 state を更新
          className="col-span-3"
          placeholder="コメントを入力 (任意)"
        />
      </div>
    </div>
  );
};

export default ModalDbHabitLogEditForm;
