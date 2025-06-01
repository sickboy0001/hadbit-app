import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image"; // next/image から Image をインポート
import { startPageContents } from "@/constants/startPage";

const StartPage = () => {
  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 画像とテキストを中央寄せにするために flex コンテナを使用することも検討できます */}
        <div className="flex flex-col items-center">
          <Image
            src="/image/title-big.png"
            alt="HadbitTracker タイトル"
            width={800}
            height={200}
            priority
            className="max-w-full h-auto" // 画像がコンテナ幅を超えないように
          />
          <p className="my-6 text-center">
            「習慣づける」て「記録する」ための「トラッカー」
          </p>
        </div>

        {/* ReactMarkdown のコンテンツもコンテナ内に配置 */}
        <article className="markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {startPageContents}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
};

export default StartPage;
