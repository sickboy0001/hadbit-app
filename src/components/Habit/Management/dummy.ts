import { TreeItem } from "@/types/habit/ui";

export const initialItems: TreeItem[] = [
  {
    id: 1,
    name: "バナナ",
    children: [
      {
        id: 2,
        name: "キャベンディッシュ",
        children: [],
        expanded: false,
      },
      {
        id: 3,
        name: "レディフィンガー",
        children: [],
        expanded: false,
      },
    ],
    expanded: false,
  },
];
