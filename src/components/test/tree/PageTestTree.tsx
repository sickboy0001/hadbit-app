"use client";
import React from "react";

import { initialItems } from "@/components/dnd-tree/dummy";
import SortableTree from "@/components/dnd-tree/SortableTree";

const DraggableTree: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main className="w-full h-[600px] max-w-2xl bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col">
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
