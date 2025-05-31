// c:\work\dev\spa\hadbit-app\src\components\organisms\LoginDialog.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // エラーメッセージ用 state
  const router = useRouter(); // ★ router インスタンスを取得
  // handleLogin を async に変更し、結果を処理
  const handleLogin = async () => {
    setIsLoading(true); // ローディング開始
    setErrorMessage(null); // エラーメッセージをリセット
    console.log("Login attempt with:", { username });
    // ★ サーバーアクションを呼び出し、結果を待つ
    const result = await signIn(username, password);

    setIsLoading(false); // ローディング終了

    if (result?.error) {
      setErrorMessage(result.error); // ★ エラーメッセージを表示 (例: ダイアログ内)
      // またはエラー用の Toast を表示しても良い
      // toast({ variant: "destructive", title: "ログインエラー", description: result.error });
    } else if (result?.success) {
      console.log("login success", result.success);
      // 成功メッセージは Header で表示するため、ここではダイアログを閉じてリロードのみ行う
      onOpenChange(false); // ダイアログを閉じる
      router.refresh(); // 必要に応じて
      sessionStorage.setItem("showLoginSuccessMessage", "true");
      window.location.reload(); // ページ全体をリロード
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ログイン</DialogTitle>
          <DialogDescription>
            ユーザー名とパスワードを入力してください。
          </DialogDescription>
        </DialogHeader>
        {errorMessage && (
          <p className="text-sm text-red-500 px-6">{errorMessage}</p>
        )}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              ユーザー名
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              disabled={isLoading} // ★ ローディング中は無効化
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              パスワード
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              onKeyDown={handleKeyDown} // ★ Enterキー押下時の処理を追加
              disabled={isLoading} // ★ ローディング中は無効化
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between items-center">
          {" "}
          {/* レイアウト調整 */}
          <Link
            href="/signin"
            className="text-sm text-blue-600 hover:underline"
          >
            アカウントをお持ちでないですか？ サインイン
          </Link>
          {/* DialogClose で囲むとキャンセルボタンになる */}
          {/* <DialogClose asChild>
          <Button type="button" variant="secondary">キャンセル</Button>
          </DialogClose> */}
          <Button type="button" onClick={handleLogin} disabled={isLoading}>
            {/* ★ ローディング中は無効化 */}
            ログイン
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
