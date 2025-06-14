"use client"; // NavigationMenuはクライアントコンポーネントである必要があるため

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { LoginDialog } from "./LoginDialog"; //  作成した LoginDialog をインポート
import { signOut } from "@/app/actions/auth"; //  ログアウトアクションをインポート
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // これをインポート
// import { Database } from "@/types/supabase"; //  Database 型をインポート
import { LoginSuccessAlert } from "@/components/molecules/LoginSuccessAlert"; // パスを修正 (必要であれば)
import { LogoutSuccessAlert } from "../molecules/LogoutSuccessAlert";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, LogIn, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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

  //  ログアウト処理
  const handleSignOut = async () => {
    await signOut();
    // setUser(null); //  サインアウト成功時に手動でユーザー状態をクリア
    router.push("/");
    //  sessionStorage にログアウト成功フラグを立てる
    sessionStorage.setItem("showLogoutSuccessMessage", "true");
    window.location.reload(); //  ページ全体をリロードしてみる
  };
  return (
    <>
      <header className="text-gray-600 body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <Link href="/" className="font-bold text-base sm:text-2xl">
            <div>
              {/* imgタグをnext/imageのImageコンポーネントに置き換え */}
              <Image
                src="/image/title-small.png"
                alt="HadbitTracker ロゴ" // より具体的なaltテキストを推奨
                width={150} // 数値で指定
                height={40} // 数値で指定
                priority // ヘッダーのロゴはLCPの候補になるため、priorityを付与
              />
            </div>
          </Link>
          <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400	flex flex-wrap items-center text-base justify-center">
            <NavigationMenu>
              <NavigationMenuList>
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
                            {/* ドロップダウンアイコンを追加 */}
                            <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
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
          </nav>
          <div className="flex items-center space-x-4">
            {/* ログイン・ログアウトUIなど */}
            {loading ? (
              <>
                <div className="h-9 w-90 animate-pulse rounded-md bg-muted flex items-center justify-end">
                  読み取り中・・・
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleSignOut}>
                      LogOut
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">ログアウト</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>ログアウト</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : user ? (
              <>
                <span className="hidden sm:inline-block text-sm text-muted-foreground truncate max-w-[90px]">
                  {username}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleSignOut}>
                      LogOut
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">ログアウト</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>ログアウト</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <span className="hidden sm:inline-block text-sm font-bold text-blue-600 truncate max-w-[90px]">
                  Guest
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setIsLoginDialogOpen(true)}
                    >
                      Login
                      <LogIn className="h-5 w-5" />
                      <span className="sr-only">ログイン</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>ログイン</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </header>
      <LogoutSuccessAlert />
      <LoginSuccessAlert />
      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      />
    </>
  );
}
