
git remote add origin git@github.com:sickboy0001/hadbit-app.git
git remote add origin https://github.com/sickboy0001/hadbit-app.git



5. Vercelへのデプロイ

最後に、作成したNext.jsアプリケーションをVercelにデプロイします。

Vercelのウェブサイト (https://vercel.com/) にアクセスし、GitHubアカウントでログインします。
ダッシュボードの「Add New...」ボタンをクリックし、「Project」を選択します。
「Import Git Repository」のセクションで、先ほどGitHubに作成したリポジトリ (<your-github-username>/<your-repository-name>) を検索または選択します。
プロジェクトの設定画面が表示されます。Next.jsプロジェクトは自動的に認識されるため、通常はデフォルトの設定のままで問題ありません。
「Deploy」ボタンをクリックします。
Vercelが自動的にあなたのGitHubリポジトリからコードをビルドし、デプロイを開始します。デプロイが完了すると、VercelからアプリケーションのURLが発行されます。このURLにアクセスすることで、あなたの「hadbit MVP」が公開されていることを確認できます。

補足:

Vercelのデプロイメントの進捗状況は、Vercelのダッシュボードで確認できます。
GitHubにプッシュするたびに、Vercelは自動的に新しいビルドとデプロイを実行します。
環境変数などの設定が必要な場合は、Vercelのプロジェクト設定で行うことができます。
これで、ReactとNext.jsで作成した「hadbit」のMVPをGitHubにプッシュし、Vercelにデプロイする手順は完了です。おめでとうございます！

MVPの開発を通して、ユーザーからのフィードバックを得ながら、徐々に機能を拡張していくと良いでしょう。頑張ってください！

test　test testtest

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
