// c:\work\dev\spa\hadbit-app\src\components\organisms\Header_dummy.ts

// メニュー項目の型定義
interface NavItemBase {
  id: string; // keyとして使用するための一意なID
  label: string;
}

interface NavLinkItem extends NavItemBase {
  type: "link";
  href: string;
}

interface NavDropdownItem extends NavItemBase {
  type: "dropdown";
  items: Array<{ id: string; href: string; label: string }>;
}

export type NavItem = NavLinkItem | NavDropdownItem;

// メニューデータ
export const headerNavItems: NavItem[] = [
  { id: "start", type: "link", label: "Start Page", href: "/start" },
  { id: "tree", type: "link", label: "habit", href: "/habit/manager" }, // test_tree は一つにまとめました
  { id: "Done", type: "link", label: "done", href: "/habit/done" }, // test_tree は一つにまとめました
  { id: "tracker", type: "link", label: "tracker", href: "/habit/tracker" }, // test_tree は一つにまとめました
  { id: "import", type: "link", label: "import", href: "/habit/logImport" }, // test_tree は一つにまとめました
  {
    id: "menu",
    type: "dropdown",
    label: "メニュー",
    items: [
      { id: "docs", href: "/docs", label: "ドキュメント" },
      { id: "settings", href: "/settings", label: "設定" },
      { id: "profile", href: "/profile", label: "プロフィール" },
    ],
  },
];
