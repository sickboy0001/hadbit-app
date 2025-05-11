import type { MutableRefObject } from "react";

export type TreeItem = {
  id: number;
  name: string;
  children: TreeItem[];
  expanded: boolean;
};

export type TreeItems = TreeItem[];

export type FlattenedItem = TreeItem & {
  depth: number;
  parentId: number | null;
  index: number;
};

export type FlattenedItems = FlattenedItem[];

export type SensorContext = MutableRefObject<{
  items: FlattenedItems;
  offset: number;
}>;
