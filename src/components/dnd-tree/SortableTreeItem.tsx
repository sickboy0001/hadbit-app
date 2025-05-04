import { CSS } from "@dnd-kit/utilities";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSSProperties } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { FlattenedItem } from "./types";
import { Button } from "../ui/button";

type SortableTreeItemProps = {
  item: FlattenedItem;
  depth: number;
  onExpand?: () => void;
  expanded?: boolean;
  indentationWidth: number;
  clone?: boolean;
  childrenCount?: number;
  onRemove?: (id: string) => void;
  onEditItem?: (id: string) => void;
};

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export const SortableTreeItem = ({
  item,
  depth,
  onExpand,
  expanded,
  indentationWidth,
  clone,
  childrenCount,
  onRemove,
  onEditItem,
}: SortableTreeItemProps) => {
  const {
    isDragging,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform,
    transition,
    attributes,
    listeners,
  } = useSortable({
    id: item.id,
    animateLayoutChanges,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <li
      ref={setDroppableNodeRef}
      className={`w-full list-none py-0.5 ${
        clone ? "absolute left-4 top-4" : ""
      }`}
      style={{
        paddingLeft: clone ? 0 : depth * indentationWidth,
      }}
    >
      <div
        ref={setDraggableNodeRef}
        className={`flex items-center gap-2 border h-14 border-gray-200 bg-white p-2 rounded ${
          isDragging ? "opacity-50 shadow-md" : "opacity-100"
        }`}
        style={style}
      >
        {clone ? (
          <span className="flex h-5 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {childrenCount && childrenCount > 0 ? childrenCount : ""}
          </span>
        ) : (
          <button
            {...attributes}
            {...listeners}
            className="text-gray-500 hover:text-gray-700 cursor-grab"
          >
            <GripVertical size={16} />
          </button>
        )}

        <div className="flex items-center gap-1.5 flex-grow">
          {onExpand && (
            <button
              onClick={onExpand}
              className="text-gray-500 hover:text-gray-700 rounded transition-colors"
            >
              {expanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          <span className="text-sm text-gray-800">{item.name}</span>
          {onEditItem && ( // onEditItem が渡されている場合のみ表示
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // イベントの伝播を止める (ドラッグ等に影響しないように)
                onEditItem(item.id);
              }}
              aria-label={`Edit ${item.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        {/* 削除ボタン */}
        {onRemove && ( // onRemove が渡された場合のみ表示
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6 text-muted-foreground hover:text-destructive" // 右寄せ、スタイル調整
            onClick={(e) => {
              e.stopPropagation(); // ドラッグイベントなどと干渉しないように
              onRemove(item.id);
            }}
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
};
