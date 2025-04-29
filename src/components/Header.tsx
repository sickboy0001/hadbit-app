// src/components/Header.tsx
"use client"; // NavigationMenuはクライアントコンポーネントである必要があるため

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils"; // shadcn/uiのセットアップで生成されるユーティリティ
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
// 必要に応じてアイコンなどをインポート
// import { Icons } from "@/components/icons";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* 左側のロゴやサイトタイトルなど */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> */}
            <span className="hidden font-bold sm:inline-block">Hadbit App</span>
          </Link>
        </div>

        {/* 中央のナビゲーションメニュー */}
        <div className="flex flex-1 items-center justify-center">
          {" "}
          {/* 中央寄せ */}
          <NavigationMenu>
            <NavigationMenuList>
              {/* --- シンプルなリンクの修正 --- */}
              <NavigationMenuItem>
                {/* /start へのリンク */}
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/start">Start Page</Link>
                </NavigationMenuLink>
                {/* /test/tree へのリンク */}
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/test/tree">test_tree</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* --- ドロップダウンメニューの例 --- */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>メニュー</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/" // 適切なリンク先を設定
                        >
                          {/* <Icons.logo className="h-6 w-6" /> */}
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Hadbit App
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            説明文などをここに書けます。
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="ドキュメント">
                      使い方やガイドなど。
                    </ListItem>
                    <ListItem href="/settings" title="設定">
                      アカウント設定など。
                    </ListItem>
                    <ListItem href="/profile" title="プロフィール">
                      あなたのプロフィール情報。
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* --- 別のシンプルなリンクの修正 --- */}
              <NavigationMenuItem>
                {/* /about へのリンク */}
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* 右側のボタンなど（例：ログイン/ログアウト） */}
        <div className="flex items-center justify-end space-x-4">
          {/* 例: <Button>ログイン</Button> */}
        </div>
      </div>
    </header>
  );
}

// ドロップダウン内のリストアイテム用コンポーネント (shadcn/uiドキュメントより)
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
