import { Habit, PresetButton } from "@/types/habit/ui";

// プリセットボタンのデータ
export const PRESET_HABIT_BUTTONS: PresetButton[] = [
  { id: "walk", name: "散歩", parentId: "exercise" },
  { id: "noelevater", name: "エレベータなし", parentId: "exercise" },
  { id: "run", name: "ランニング", parentId: "exercise" },
  { id: "gym-visit", name: "ジム訪問", parentId: "gym" },
  { id: "gym-runing", name: "ランニングマシン", parentId: "gym" },
  { id: "dev-study", name: "開発学習", parentId: "programming" },
  { id: "dev-designe", name: "デザイン", parentId: "programming" },
  { id: "read-book", name: "読書", parentId: "learning" },
  { id: "schoo", name: "schoo", parentId: "learning" },
  { id: "youtube-learn", name: "youtube", parentId: "learning" },
  // 必要に応じて他のプリセットボタンを追加
];

// サンプル習慣データを作成する関数
export function createSampleData(): Habit[] {
  return [
    {
      id: "exercise",
      name: "運動",
      level: 0,
      logs: [],
    },
    // 他のトップレベルの習慣カテゴリを追加
  ];
}
