"use client";

import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

export function LogoutSuccessAlert() {
  const [isVisible, setIsVisible] = useState(false);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // sessionStorage をチェックしてログアウト成功メッセージを表示
    const logoutSuccessFlag = sessionStorage.getItem(
      "showLogoutSuccessMessage"
    ); // ★ キーを変更
    if (logoutSuccessFlag === "true") {
      setIsVisible(true);
      sessionStorage.removeItem("showLogoutSuccessMessage"); // ★ キーを変更

      // 既存のタイマーがあればクリア
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      // 3秒後にメッセージを消すタイマーを設定し、ID を ref に保存
      alertTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
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

  return (
    // ★ スタイルはログイン成功時と同じ緑色系を使用（必要なら変更）
    <Alert className="pl-4 pr-10 py-3 absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-auto max-w-sm bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 z-60 shadow-lg">
      <AlertDescription>ログアウトしました。</AlertDescription>{" "}
      {/* ★ メッセージを変更 */}
      <button
        onClick={handleCloseAlert}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-800 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400" // ★ ボタンの色もグレー系に
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}
