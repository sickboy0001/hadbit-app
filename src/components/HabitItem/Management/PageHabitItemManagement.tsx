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
    <div className="w-full  max-w-2xl bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col mx-auto">
      <div className="p-3 bg-gray-100">
        {user ? `${user.email} ${user.userid} ${user.username}` : ""}
      </div>
      <div className="flex-1 overflow-auto p-3">
        <ManagementTree />
      </div>
    </div>
  );
};

export default PageHabitItemManagement;
