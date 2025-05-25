import PageHabitTracker from "@/components/Habit/Tracker/PageHabitTracker";

export default async function HabitItemsPage() {
  // サーバーコンポーネントで初期データを取得

  return (
    <div className="container mx-auto ">
      <PageHabitTracker />
    </div>
  );
}
