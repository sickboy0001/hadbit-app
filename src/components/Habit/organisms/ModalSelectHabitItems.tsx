// src/components/Habit/Tracker/SelectHabitItemsModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HabitItem } from "@/types/habit/habit_item";

interface SelectHabitItemsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  habitItems: HabitItem[];
  selectedHabitItemIds: number[];
  onSave: (newSelectedIds: number[]) => void;
  summaryName?: string; // オプションでサマリ名を表示
}

const SelectHabitItemsModal: React.FC<SelectHabitItemsModalProps> = ({
  isOpen,
  onOpenChange,
  habitItems,
  selectedHabitItemIds,
  onSave,
  summaryName,
}) => {
  const [currentSelectedIds, setCurrentSelectedIds] = useState<Set<number>>(
    new Set(selectedHabitItemIds)
  );

  // props.selectedHabitItemIds が変更されたら内部ステートも更新
  useEffect(() => {
    setCurrentSelectedIds(new Set(selectedHabitItemIds));
  }, [selectedHabitItemIds]);

  const handleCheckboxChange = (itemId: number, checked: boolean) => {
    setCurrentSelectedIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (checked) {
        newSelectedIds.add(itemId);
      } else {
        newSelectedIds.delete(itemId);
      }
      return newSelectedIds;
    });
  };

  const handleSave = () => {
    onSave(Array.from(currentSelectedIds));
    onOpenChange(false); // モーダルを閉じる
  };
  const handleClearAll = () => {
    setCurrentSelectedIds(new Set()); // すべての選択をクリア
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            習慣を選択 {summaryName && `(${summaryName})`}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-2">
            {habitItems.map((item) => {
              return (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`habit-${item.id}`}
                    checked={currentSelectedIds.has(item.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(item.id, Boolean(checked))
                    }
                  />
                  <label
                    htmlFor={`habit-${item.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.name}
                  </label>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <DialogFooter>
          <div className="mr-auto">
            {/* このdivでラップし、mr-autoを適用 */}
            <Button type="button" variant="outline" onClick={handleClearAll}>
              すべてクリア
            </Button>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectHabitItemsModal;
