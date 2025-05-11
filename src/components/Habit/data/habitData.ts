// Habit 型定義 (HabitDisplayTable.tsx や他の場所でも使われる想定)
export type Habit = {
  id: string;
  name: string;
  parentId?: string;
  children?: Habit[];
  completedDates?: Date[]; // 完了日を記録する配列
  level: number; // 階層の深さ
};

// PresetButton 型定義 (PresetButtonsSection.tsx で使われる想定)
export type PresetButton = {
  id: string;
  name: string;
  parentId: string; // どの親習慣に紐づくか
};

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
      completedDates: [],
      children: [
        {
          id: "walk",
          name: "散歩",
          parentId: "exercise",
          level: 1,
          completedDates: [
            new Date(2025, 4, 1), // 2024年5月1日 (月は0から始まるため4は5月)
            new Date(2025, 4, 3),
            new Date(2025, 4, 5),
            new Date(2025, 4, 7),
            new Date(2025, 4, 8),
            new Date(2025, 4, 10),
          ],
        },
        {
          id: "run",
          name: "ランニング",
          parentId: "exercise",
          level: 1,
          completedDates: [],
        },
        {
          id: "gym",
          name: "ジム",
          parentId: "exercise",
          level: 1,
          completedDates: [],
          children: [
            {
              id: "gym-visit",
              name: "ジム訪問",
              parentId: "gym",
              level: 2,
              completedDates: [],
            },
            {
              id: "cardio",
              name: "有酸素運動",
              parentId: "gym",
              level: 2,
              completedDates: [],
            },
            {
              id: "strength",
              name: "筋力トレーニング",
              parentId: "gym",
              level: 2,
              completedDates: [new Date(2025, 4, 2), new Date(2025, 4, 6)],
            },
          ],
        },
        {
          id: "stairs",
          name: "階段を使う",
          parentId: "exercise",
          level: 1,
          completedDates: [],
        },
        {
          id: "squat",
          name: "スクワット",
          parentId: "exercise",
          level: 1,
          completedDates: [],
        },
      ],
    },
    {
      id: "measurement",
      name: "測定",
      level: 0,
      completedDates: [],
      children: [
        {
          id: "weight",
          name: "体重測定",
          parentId: "measurement",
          level: 1,
          completedDates: [],
        },
      ],
    },
    {
      id: "learning",
      name: "学習",
      level: 0,
      completedDates: [],
      children: [
        {
          id: "read-book",
          name: "読書",
          parentId: "learning",
          level: 1,
          completedDates: [],
        },
        {
          id: "schoo",
          name: "Schoo",
          parentId: "learning",
          level: 1,
          completedDates: [],
        },
        {
          id: "programming",
          name: "プログラミング",
          parentId: "learning",
          level: 1,
          completedDates: [],
          children: [
            {
              id: "dev-study",
              name: "開発学習",
              parentId: "programming",
              level: 2,
              completedDates: [],
            },
            {
              id: "frontend",
              name: "フロントエンド",
              parentId: "programming",
              level: 2,
              completedDates: [],
            },
          ],
        },
      ],
    },
    // 他のトップレベルの習慣カテゴリを追加
  ];
}
