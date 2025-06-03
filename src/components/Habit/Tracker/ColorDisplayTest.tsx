import {
  getBackgroundColorWithOpacity,
  getBorderColorWithOpacity,
} from "@/lib/colorUtils";
import React from "react";

interface ColorDisplayTestProps {
  title: string;
  colors: string[];
}

const ColorDisplayTest: React.FC<ColorDisplayTestProps> = ({
  title,
  colors,
}) => {
  if (!colors || colors.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500">表示する色がありません。</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-4">
        {colors.map((color, index) => {
          // 有効なHEXカラーでない場合はデフォルトスタイルを適用
          return (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{
                borderColor: getBorderColorWithOpacity(color),

                borderWidth: "2px",
                borderStyle: "solid",
                backgroundColor: getBackgroundColorWithOpacity(color),
                minWidth: "100px", // ボタンの最小幅
              }}
              // ボタンがクリックされたときの動作 (例: 色情報をコンソールに出力)
              onClick={() => console.log("Color button clicked:", color)}
            >
              <span className="text-xs font-mono">{color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorDisplayTest;
