import { UniqueIdentifier } from "@dnd-kit/core";
import type { RefObject } from "react";

export type TreeItem = {
  id: string;
  name: string;
  children: TreeItem[];
  expanded: boolean;
};

export type TreeItems = TreeItem[];

export type FlattenedItem = TreeItem & {
  depth: number;
  parentId: UniqueIdentifier | null;
  index: number;
};

export type FlattenedItems = FlattenedItem[];

export type SensorContext = RefObject<{
  items: FlattenedItems;
  offset: number;
}>;
