import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image"; // next/image から Image をインポート

const contents = `
### HadbitTracker
### ■動機（Incentive）：なぜ作ろうと思ったのか
「HadbitTracker」「習慣付けのため」に、やったことを登録する仕組みです。  
習慣化はやりたくても、やりきれないもの・・・
なんとかいい習慣は身に着けたいので、そのためのツールです。
最初はNotionでそれっぽい物作ってたけど、操作感や実施することのモチベーション上げるための画面作れなくて自分で作成した次第
### ■目的（Aim）：狙い
- 「習慣をつける」はなかなか実践したくてもできないもの
- それを支援するためのツール

### ■概要（Overview）：
- 「Habit」で登録、「logs」で記録、「Tracker」、「Summary」で登録されたものを確認
- 「Habit」で習慣化したい項目（運動、勉強など）を登録
  - 分類があり、その下に、実際の項目を入れていく感じになります。
    - 分類は「運動」「学習」「計測」などを想定
  - できるだけ細かい単位での登録の方がいいと思います
  - 「運動」など曖昧な項目でなく、「腕立て３０回」「10分瞑想」「読書３０ページ」「体重」などの方が有効だと思います。
- 「Done」で実施した時に登録する
- 「Tracker」で実施した内容など確認可能
- 「Summary」で実施の状況など確認可能。
- 「Tracker」「Done」からは登録した内容を変更（日付や、コメント）可能
- 「Import」で、Habit指定で、CSV形式から取り込むことができます。

### ■履歴（Hitory）:
- 2025年6月末
  - 個人での利用想定して公開。
  - ログイン機能は既存の機能を使う予定
- 2025年7月末
  - 他者への開示情報を見れるようにする。
  - 特定の人の開示OKのもの情報が見れればいいのかと。

`;

const StartPage = () => {
  return (
    <div className="p-4">
      {/* Optional: Add some padding around the content */}

      <Image
        src="/image/title-big.png"
        alt="HadbitTracker タイトル" // より具体的なaltテキストを推奨
        width={800} // 画像の実際の幅、または表示したい幅 (例: 800px)
        height={200} // 画像の実際の高さ、または表示したい高さ (例: 200px)
        priority // スタートページの主要な画像であるため、priorityを付与
      />
      <p className="mb-6">「習慣づける」ための「トラッカー」</p>

      <article className="markdown">
        {/* Apply prose class here */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{contents}</ReactMarkdown>
      </article>
    </div>
  );
};

export default StartPage;
