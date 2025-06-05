import React from "react";
import { icons as lucideIcons, HelpCircle } from "lucide-react"; // lucide-react から icons とデフォルトアイコンをインポート

interface IconDisplayTestProps {
  title: string;
  icons: string[]; // アイコン名の配列
}

const IconDisplayTest: React.FC<IconDisplayTestProps> = ({ title, icons }) => {
  if (!icons || icons.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500">表示するアイコンがありません。</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-4">
        {icons.map((iconName, index) => {
          const IconComponent =
            lucideIcons[iconName as keyof typeof lucideIcons] || HelpCircle;

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-3 rounded-lg shadow-md border border-gray-300 bg-white"
              style={{ minWidth: "16px" }}
            >
              <span
                className="inline-flex items-center justify-center h-5 w-5 text-blue-500 text-xs font-bold cursor-default" // cursor-default を追加
              >
                <IconComponent className="mb-2 text-gray-700" />
              </span>

              <span className="text-xs font-mono text-gray-600">
                {iconName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IconDisplayTest;
