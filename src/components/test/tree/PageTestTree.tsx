"use client";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const DraggableTree: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading user info...</div>;
  }

  if (!user) {
    return <div>Please log in.</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main className="w-full h-[600px] max-w-2xl bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col">
        Welcome, {user.email}!{/* ユーザー情報を使った処理 */}
        <div className="bg-gray-100 border-b border-gray-200 p-4 text-gray-700 font-semibold">
          ドラッグ可能な階層ツリーのサンプル
        </div>
        <div className="flex-1 overflow-auto p-6">
          {/* <SortableTree defaultItems={initialItems} /> */}
        </div>
        <div className="bg-gray-50 border-t border-gray-200 p-4 text-xs text-gray-500 text-center">
          ツリーアイテムをドラッグ＆ドロップで並び替えできます
        </div>
      </main>
    </div>
  );
};

export default DraggableTree;
