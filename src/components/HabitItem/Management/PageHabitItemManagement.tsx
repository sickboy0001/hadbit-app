"use client";
import React from "react";

import ManagementTree from "./ManagementTree";

const PageHabitItemManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2">
      <main className="w-full  max-w-2xl bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          <ManagementTree />
        </div>
      </main>
    </div>
  );
};

export default PageHabitItemManagement;
