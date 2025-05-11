import { CSS } from "@dnd-kit/utilities";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSSProperties } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Pencil,
} from "lucide-react";
import { FlattenedItem } from "@/types/habit/ui";

type SortableTreeItemProps = {
  item: FlattenedItem;
  depth: number;
  onEditItem?: (id: number) => void;
  onRemoveItem?: (id: number) => void;
  onExpand?: () => void;
  expanded?: boolean;
  indentationWidth: number;
  clone?: boolean;
  childrenCount?: number;
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
  onEditItem,
  indentationWidth,
  clone,
  childrenCount,
  onRemoveItem,
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
          {/* 編集ボタン (名前の横) */}
          {!clone && onEditItem && (
            <button
              onClick={() => onEditItem(item.id)}
              className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors ml-2" // 名前との間にマージンを追加
              aria-label="編集"
            >
              <Pencil size={16} />
            </button>
          )}
          {/* 削除ボタン (右端) */}
          {!clone && onRemoveItem && (
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-red-500 hover:text-red-700 p-1 rounded transition-colors ml-auto" // ml-auto で右端に配置
              aria-label="削除"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </li>
  );
};
