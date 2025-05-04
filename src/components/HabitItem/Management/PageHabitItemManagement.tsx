"use client";
import React from "react";

import ManagementTree from "./ManagementTree";
import { useAuth } from "@/contexts/AuthContext";
const PageHabitItemManagement: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading user info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex  justify-center p-2">
      <main className="w-full  max-w-2xl bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col">
        {user ? <div>Welcome, {user.email}!</div> : "Guest!"}
        {user ? user.userid : ""}
        {user ? user.username : ""}

        <div className="flex-1 overflow-auto p-6">
          <ManagementTree />
        </div>
      </main>
    </div>
  );
};

export default PageHabitItemManagement;
