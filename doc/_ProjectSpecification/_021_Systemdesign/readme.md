
## システム構成図
```
sickboy0001/hadbit-app https://github.com/sickboy0001/hadbit-app
├ public
├ src                →ソース
│ ├ app              →アプリ用ソース
│ │ ├ start          →ページ用ディレクトリ
│ │ │ └ page.tsx     →ページ本体
│ │ ├ test/tree      →ページ用ディレクトリ
│ │ │ └ page.tsx     →ページ本体
│ │ ├ favicon.ico
│ │ ├ globals.css
│ │ ├ layout.tsx    →レイアウト
│ │ └ page.tsx      →ページ本体
│ ├ components      →実装
│ │ ├ HabitItem/Management  →機能単位での実装・習慣化項目メンテナンス
│ │ │ ├ ManagementTree.tsx           →機能の実装部分
│ │ │ └ PageHabitItemManagement.tsx　→Pagexxxxは、各ページから呼ばれるもの
│ │ ├ dnd-tree
│ │ ├ test/tree       　→テスト用の機能
│ │ ├ ui                →shadcnui用
│ │ └ Header.tsx        →layoutで使う情報
│ └ lib
│    └ utils.ts
├ .gitignore
├ README.md
├ components.json
├ eslint.config.mjs
├ next.config.ts
├ package-lock.json
├ package.json
├ postcss.config.mjs
└ tsconfig.json
※sample)├│─└
```

### 連番
1. test
1. test2

### ■参考
htmlurl エンコーディング、デコーディング
https://dobon.net/vb/dotnet/internet/urlencode.html#google_vignette



<details><summary>すごく長い文章とかプログラムとか</summary>

```python
print('Hello world!')
```
</details>


### Html出力時の注意
Htmlの中で
markdown,highlightの参照がるので、以下に置き換えが必要
また、該当Html保存している場所に、「markdown.css」「highlight.css」が必要

```html
<link rel="stylesheet" href="./markdown.css">
<link rel="stylesheet" href="./highlight.css">
```
