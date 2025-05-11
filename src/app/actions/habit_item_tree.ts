"use server";
import { createClient } from "@/util/supabase/server";
// import { revalidatePath } from "next/cache";

// habit_item_tree に新しいエントリを作成
export async function createHabitItemTreeEntry(
  itemId: number,
  parentId: number | null = null
) {
  const supabase = await createClient();

  // 1. 同じ parent_id を持つ最大の order_no を取得するクエリ
  let query = supabase
    .from("habit_item_tree")
    .select("order_no", { count: "exact", head: false }) // order_no のみ取得
    .order("order_no", { ascending: false }) // order_no で降順ソート
    .limit(1); // 最大値の1件のみ取得

  // parentId の有無で WHERE 条件を分岐
  if (parentId === null) {
    query = query.is("parent_id", null); // parent_id が NULL のものを検索
  } else {
    query = query.eq("parent_id", parentId); // 指定された parent_id のものを検索
  }

  const { data: maxOrderData, error: maxOrderError } = await query.single();

  if (maxOrderError && maxOrderError.code !== "PGRST116") {
    // PGRST116: No rows found (データがない場合はエラーではない)
    console.error("Error fetching max order_no:", maxOrderError);
    throw new Error(
      `最大順序番号の取得に失敗しました: ${maxOrderError.message}`
    );
  }

  // 2. 次の order_no を計算 (最大値 + 1、データがなければ 1)
  const nextOrderNo = maxOrderData ? (maxOrderData.order_no || 0) + 1 : 1;

  const { data, error } = await supabase.from("habit_item_tree").insert({
    item_id: itemId,
    parent_id: parentId,
    order_no: nextOrderNo,
  });

  if (error) {
    console.error("Error creating habit item tree entry:", error);
    throw new Error(`ツリー構造の作成に失敗しました: ${error.message}`);
  }
  console.log(data);
  // revalidatePath('/test/tree'); // 必要に応じてツリー表示ページのパスを再検証
}
