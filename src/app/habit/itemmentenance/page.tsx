import { PageHabitItemsManager } from "@/components/Habit/Management/PageHabitItemsManager";

export default async function HabitItemsPage() {
  // サーバーコンポーネントで初期データを取得

  return (
    <div className="container mx-auto py-10">
      <PageHabitItemsManager />
    </div>
  );
}
