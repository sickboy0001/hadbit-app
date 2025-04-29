import { TreeItem } from "./types";

export const initialItems: TreeItem[] = [
  {
    id: "1",
    name: "バナナ",
    children: [
      {
        id: "2",
        name: "キャベンディッシュ",
        children: [],
        expanded: false,
      },
      {
        id: "3",
        name: "レディフィンガー",
        children: [],
        expanded: false,
      },
    ],
    expanded: false,
  },
  {
    id: "4",
    name: "リンゴ",
    children: [
      {
        id: "5",
        name: "ふじ",
        children: [],
        expanded: false,
      },
      {
        id: "6",
        name: "紅玉",
        children: [],
        expanded: false,
      },
    ],
    expanded: false,
  },
  {
    id: "7",
    name: "オレンジ",
    children: [],
    expanded: false,
  },
  {
    id: "8",
    name: "メロン",
    children: [
      {
        id: "9",
        name: "マスクメロン",
        children: [],
        expanded: false,
      },
    ],
    expanded: false,
  },
];
