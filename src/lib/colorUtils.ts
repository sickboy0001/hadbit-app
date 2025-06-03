// HEXカラーコードが有効かどうかを簡易的にチェックする関数
export const isValidHexColor = (hex: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(hex);
};

// ボーダーカラーのスタイル文字列を生成するヘルパー関数
// 例: #RRGGBB -> #RRGGBB80 (約50%の透明度)
export const getBorderColorWithOpacity = (
  color: string
): string | undefined => {
  const safeColor = isValidHexColor(color) ? color : "#CCCCCC"; // 無効な場合はグレー
  return safeColor ? `${safeColor}80` : undefined;
};

// 背景色のスタイル文字列を生成するヘルパー関数
// 例: #RRGGBB -> #RRGGBB10 (約6%の透明度)
export const getBackgroundColorWithOpacity = (
  color: string
): string | undefined => {
  const safeColor = isValidHexColor(color) ? color : "#CCCCCC"; // 無効な場合はグレー
  // console.log("getBackgroundColorWithOpacity called", color, safeColor);

  return safeColor ? `${safeColor}10` : undefined;
};

interface ItemStyleLike {
  color?: unknown; // colorプロパティが存在するかもしれないことを示す
}

// HabitItemのitem_styleから色情報を抽出するヘルパー関数
export const getColorHabitItemItemStyle = (
  item_style: string | object | null | undefined
): string | undefined => {
  if (!item_style) {
    return undefined;
  }

  if (typeof item_style === "string") {
    try {
      const parsedStyle = JSON.parse(item_style);
      if (
        typeof parsedStyle === "object" &&
        parsedStyle !== null &&
        typeof parsedStyle.color === "string"
      ) {
        return parsedStyle.color;
      }
    } catch (e) {
      console.log(e);
      // console.warn(`Failed to parse item_style string:`, item_style, e); // 必要に応じてログ出力
    }
  } else if (typeof item_style === "object" && item_style !== null) {
    // item_style がオブジェクトであり、color プロパティが文字列型であるかを確認
    if (typeof (item_style as ItemStyleLike).color === "string") {
      return (item_style as ItemStyleLike).color as string;
    }
  }
  return undefined;
};
