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

export const color_def = [
  "#B80000", // 現在の赤
  "#DB3E00", // 現在のオレンジ
  "#FF5733", // 明るいオレンジレッド (新)
  "#008B02", // 現在の緑
  "#32CD32", // 明るい緑 (新)
  "#006B76", // 現在の青緑
  "#007F7F", // 深いエメラルドグリーン (新)
  "#1273DE", // 現在の青
  "#6495ED", // 明るいスカイブルー (新)
  "#004DCF", // 現在の濃い青
  "#000066", // より深いネイビー (新)
  "#5300EB", // 現在の紫
  "#9966CC", // 明るいラベンダー (新)
  "#C69300", // 現在の黄土色
  "#DAA520", // 明るいマスタード (新)
  // "#FFC0CB", // ピンク (新)
  // "#40E0D0", // ターコイズ (新)
  "#A52A2A", // ブラウン (新)
  "#666666", // 現在の濃い灰色
  // "#4F4F4F", // より濃い灰色 (新)
  // "#D3D3D3", // 明るい灰色 (新)
  // "#EEEEEE", // 非常に明るい灰色 (新)
];

// export const DummyHabitLogSummarySettings = (
//   allHabitItemIds: number[]
// ): HabitLogSummarySettings => {
//   return habitLogSummarySettings;
// };

// const habitLogSummarySettings: HabitLogSummarySettings = {
//   logSummary: {
//     "a1b2c3d4-e5f6-7890-1234-567890abcdef": {
//       // テーブル名: 例えばAPIリクエストのログ
//       name: "運動のサマリ", // この設定の名前
//       description: "運動の一覧（１日、２１日間）",
//       filtersHabitItemIds: [46, 48, 47, 49, 50], // ジム、階段、ウォーキング、クランク、登山
//       type: "1day",
//       isExpanded: true,
//     },
//     "b2c3d4e5-f6a7-8901-2345-67890abcdef0": {
//       // テーブル名: 例えばAPIリクエストのログ
//       name: "余暇のサマリ", // この設定の名前
//       description: "余暇の一覧（１日、２１日間）",
//       filtersHabitItemIds: [43, 44, 45], //飲み、外食、立ち飲み
//       type: "1day",
//       isExpanded: true,
//     },
//     "c3d4e5f6-a7b8-9012-3456-7890abcdef01": {
//       // テーブル名: 例えばAPIリクエストのログ
//       name: "観察のサマリ", // この設定の名前
//       description: "観察の一覧（１日、２１日間）",
//       filtersHabitItemIds: [39], //体重
//       type: "1day",
//       isExpanded: true,
//     },
//     "d4e5f6a7-b8c9-0123-4567-890abcdef012": {
//       // テーブル名: 例えばAPIリクエストのログ
//       name: "学習のサマリ", // この設定の名前
//       description: "学習の一覧（１日、２１日間）",
//       filtersHabitItemIds: [40, 41], //schoo,youtube
//       type: "1day",
//       isExpanded: true,
//     },
//   },
//   globalLogSummaryDisplayOrder: [
//     // LogSummary内のテーブル表示順序
//     "a1b2c3d4-e5f6-7890-1234-567890abcdef", // 運動
//     "b2c3d4e5-f6a7-8901-2345-67890abcdef0", // 余暇
//     "c3d4e5f6-a7b8-9012-3456-7890abcdef01", // 観察
//     "d4e5f6a7-b8c9-0123-4567-890abcdef012", // 学習
//   ],
//   //crypto.randomUUID()
//   //Object.keys(log_summary).find(uuid => log_summary[uuid].display_name === "運動")
// };
