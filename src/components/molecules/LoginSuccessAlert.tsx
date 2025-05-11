"use client";

import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function LoginSuccessAlert() {
  const [isVisible, setIsVisible] = useState(false);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // sessionStorage をチェックしてログイン成功メッセージを表示
    const loginSuccessFlag = sessionStorage.getItem("showLoginSuccessMessage");
    if (loginSuccessFlag === "true") {
      setIsVisible(true);
      sessionStorage.removeItem("showLoginSuccessMessage"); // フラグを削除

      // 既存のタイマーがあればクリア
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      // 3秒後にメッセージを消すタイマーを設定し、ID を ref に保存
      alertTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    }

    // コンポーネントのアンマウント時にタイマーをクリア
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []); // マウント時に一度だけ実行

  const handleCloseAlert = () => {
    setIsVisible(false);
    // タイマーもクリア
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
  };

  if (!isVisible) {
    return null; // 表示しない場合は何もレンダリングしない
  }

  const username = user ? user.username : "";
  const userid = user ? user.userid : "";

  // const msg = `<div>ログインしました！</div>
  //   <div>${username} [${userid}]</div>`;

  return (
    <Alert className="pl-4 pr-10 py-3 absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-auto max-w-sm bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100 z-60 shadow-lg">
      <AlertDescription>
        ログインしました！
        <br />
        {username} [{userid}]
      </AlertDescription>
      <button
        onClick={handleCloseAlert}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-green-800 hover:bg-green-200 dark:text-green-100 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}
