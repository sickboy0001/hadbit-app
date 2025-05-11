import PageHabitTracker from "@/components/Habit/PageHabitTracker";

export default async function HabitItemsPage() {
  // サーバーコンポーネントで初期データを取得

  return (
    <div className="container mx-auto py-10">
      <PageHabitTracker />
    </div>
  );
}
