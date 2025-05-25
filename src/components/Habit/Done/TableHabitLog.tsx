import React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { parseISO } from "date-fns/parseISO";
import { PencilIcon, Trash2 } from "lucide-react";

import { DbHabitLog } from "@/app/actions/habit_logs";
import { formatUtcToJstString } from "@/lib/datetime";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface HabitLogTableProps {
  habitlogs: DbHabitLog[];
  getHabitItemNameById: (itemId: number) => string;
  handleOpenLogEditDialog: (log: DbHabitLog) => void;
  handleOpenDeleteDialog: (log: DbHabitLog) => void;
}

const TableHabitLog: React.FC<HabitLogTableProps> = ({
  habitlogs,
  getHabitItemNameById,
  handleOpenLogEditDialog,
  handleOpenDeleteDialog,
}) => {
  return (
    <Card>
      <CardContent className="overflow-auto p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px] font-bold">習慣名</TableHead>
              <TableHead className="w-[140px] font-bold">実行日</TableHead>
              <TableHead className="font-bold">コメント</TableHead>
              <TableHead className="w-[170px] font-bold hidden sm:table-cell">
                登録日時
              </TableHead>
              <TableHead className="w-[170px] font-bold hidden sm:table-cell">
                更新日時
              </TableHead>
              <TableHead className="w-[50px] text-right font-bold">
                {/* 右端の操作列の幅を調整 */}
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {habitlogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  記録はありません。
                </TableCell>
              </TableRow>
            ) : (
              habitlogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getHabitItemNameById(log.item_id)}</span>
                      <Button
                        variant="ghost"
                        size="icon" // アイコンのみのボタン
                        className="h-7 w-7" // サイズを小さく
                        onClick={() => handleOpenLogEditDialog(log)}
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">編集</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(log.done_at), "yyyy年M月d日", {
                      locale: ja,
                    })}
                  </TableCell>
                  <TableCell className="whitespace-pre-wrap">
                    {log.comment}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatUtcToJstString(log.created_at)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatUtcToJstString(log.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleOpenDeleteDialog(log)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TableHabitLog;
