"use client"; // NavigationMenuはクライアントコンポーネントである必要があるため

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { headerNavItems } from "@/constants/menu";
import { LoginDialog } from "./LoginDialog"; // ★ 作成した LoginDialog をインポート
import { signOut } from "@/app/actions/auth"; // ★ ログアウトアクションをインポート
import { useState } from "react"; // ★ useEffect を削除
import { useRouter } from "next/navigation";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // ★ これをインポート
// import { Database } from "@/types/supabase"; // ★ Database 型をインポート
import { LoginSuccessAlert } from "@/components/molecules/LoginSuccessAlert"; // ★ パスを修正 (必要であれば)
import { LogoutSuccessAlert } from "../molecules/LogoutSuccessAlert";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, loading } = useAuth(); // ★ Context からユーザー情報とローディング状態を取得
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const router = useRouter(); // ★ router インスタンスを取得
  const username = user ? user.username : "";

  // ★ ログイン/ログアウト時にダイアログを閉じる処理 (必要であれば useAuth の user 変更を監視する useEffect を追加)
  React.useEffect(() => {
    if (user !== undefined) {
      // user が null または User オブジェクトになったら (初期ロード完了後)
      setIsLoginDialogOpen(false);
    }
  }, [user]); // user の変化を監視

  // ★ ログアウト処理
  const handleSignOut = async () => {
    await signOut();
    // setUser(null); // ★ サインアウト成功時に手動でユーザー状態をクリア
    router.push("/");
    // ★ sessionStorage にログアウト成功フラグを立てる
    sessionStorage.setItem("showLogoutSuccessMessage", "true");
    window.location.reload(); // ★ ページ全体をリロードしてみる
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <LogoutSuccessAlert /> {/* ★ ログアウト用アラートをレンダリング */}
        <LoginSuccessAlert /> {/* ★ 新しいコンポーネントをレンダリング */}
        {/* 左側のロゴやサイトタイトルなど */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> */}
            <span className="hidden font-bold sm:inline-block">Hadbit App</span>
          </Link>
        </div>
        {/* 中央のナビゲーションメニュー */}
        <div className="flex flex-1 items-center justify-end">
          {/* 中央寄せ */}
          <NavigationMenu>
            <NavigationMenuList>
              {/* ★ headerNavItems をループしてメニュー項目を生成 */}
              {headerNavItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  {item.type === "link" && (
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </NavigationMenuLink>
                  )}
                  {item.type === "dropdown" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                          )}
                        >
                          {item.label}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        {item.items.map((subItem) => (
                          <DropdownMenuItem key={subItem.id} asChild>
                            <Link href={subItem.href}>{subItem.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center justify-end space-x-4 ml-4">
          {/* ml-4 を追加してナビゲーションとの間隔を調整 */}
          {loading ? (
            // ローディング中は何も表示しないか、スケルトンローダーなどを表示
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            // ログイン済みの場合
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {username} {/* ユーザーのメールアドレスなどを表示 */}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                ログアウト
              </Button>
            </>
          ) : (
            // 未ログインの場合
            <Button onClick={() => setIsLoginDialogOpen(true)}>ログイン</Button>
          )}
        </div>
      </div>

      {/* ★ LoginDialog コンポーネントをレンダリング */}
      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      />
    </header>
  );
}
