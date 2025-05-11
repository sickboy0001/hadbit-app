"use server";

import {
  HabitItem,
  HabitItemTree,
  HabitItemWithTreeInfo,
} from "@/types/habit/habit_item";
import { createClient } from "@/util/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 指定されたユーザーIDの習慣項目とツリー情報を取得します。
 * Supabase のネスト select と LEFT JOIN ヒント (!left) を使用します。
 * (Supabase ダッシュボードまたはDBでリレーションシップが定義されている必要があります)
 * @param userId ユーザーID
 * @returns 習慣項目とツリー情報の配列 (HabitItemWithTreeInfo[])
 */
export async function readHabitItemsWithTreeInfo(
  userId: number
): Promise<HabitItemWithTreeInfo[]> {
  console.log(
    `[Action] readHabitItemsWithTreeInfo (Query) called for userId: ${userId}`
  );
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habit_items")
    .select("*, habit_item_tree!left(parent_id, order_no)") // !left で LEFT JOIN を試みる
    .eq("user_id", userId)
    .eq("delete_flag", false); // 論理削除されていないもの

  if (error) {
    console.error("Error reading habit items with tree info:", error);
    throw new Error("Failed to fetch habit items with tree info.");
  }
  console.log(
    `[Action] readHabitItemsWithTreeInfo (Query) found ${
      data?.length || 0
    } items.`
  );
  // Supabase の JOIN 結果はネストされているので、フラット化する
  const flattenedData =
    data?.map((item) => ({
      ...item,
      parent_id: item.habit_item_tree?.parent_id ?? null,
      order_no: item.habit_item_tree?.order_no ?? null,
      habit_item_tree: undefined, // 元のネストしたプロパティを削除
    })) || [];

  return flattenedData as HabitItemWithTreeInfo[];
}

export async function readHabitItemTreeWithUserId(
  userId: number
): Promise<HabitItemTree[]> {
  console.log(
    `[Action] readHabitItemsWithTreeInfo (Query) called for userId: ${userId}`
  );
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habit_items")
    .select("habit_item_tree!left(item_id,parent_id, order_no)") // !left で LEFT JOIN を試みる
    .eq("user_id", userId)
    .eq("delete_flag", false); // 論理削除されていないもの

  if (error) {
    console.error("Error reading habit items with tree info:", error);
    throw new Error("Failed to fetch habit items with tree info.");
  }
  console.log(
    `[Action] readHabitItemsWithTreeInfo (Query) found ${
      data?.length || 0
    } items.`
  );
  // Supabase の JOIN 結果はネストされているので、フラット化する
  // const flattenedData =
  //   data
  //     ?.map((item) => {
  //       // habit_item_tree が存在しない場合は undefined を返す。存在する場合は、item_id を habit_items.id から取得する
  //       return item.habit_item_tree
  //         ? {
  //             item_id: item.habit_item_tree.item_id,
  //             parent_id: item.habit_item_tree.parent_id,
  //             order_no: item.habit_item_tree.order_no,
  //           }
  //         : undefined;
  //     })
  //     .filter((item): item is HabitItemTree => item !== undefined) || []; // undefined でない要素のみを残す

  // console.log(
  //   "[Action] allTreeEntries before filtering:",
  //   JSON.stringify(data, null, 2)
  // );

  const allTreeEntries: HabitItemTree[] =
    data?.flatMap((habitItemContainer) => {
      // ログに基づくと、habitItemContainer.habit_item_tree は実行時にはオブジェクトです。
      // TypeScript の型定義が配列を示唆している場合、実際の型にアサーションします。
      const treeNodeAsObject =
        habitItemContainer.habit_item_tree as unknown as HabitItemTree;

      if (treeNodeAsObject && typeof treeNodeAsObject.item_id === "number") {
        return [
          // flatMap は配列を返すことを期待します。
          {
            item_id: treeNodeAsObject.item_id, // HabitItemTree 型の item_id は number
            parent_id: treeNodeAsObject.parent_id ?? null,
            order_no: treeNodeAsObject.order_no ?? null,
          },
        ];
      }
      return []; // この habitItemContainer にツリーエントリがない場合や、habit_item_tree が配列でない場合は空配列を返す
    }) || [];

  // return flattenedData as HabitItemTree[];
  // console.log(
  //   "[Action] Final allTreeEntries:",
  //   JSON.stringify(allTreeEntries, null, 2)
  // );
  return allTreeEntries;
}

// 習慣項目リストを取得 (Read)
export async function readHabitItems(userId: number): Promise<HabitItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habit_items")
    .select("*")
    .eq("user_id", userId)
    .eq("delete_flag", false) // 論理削除されていないもの
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error reading habit items:", error);
    throw new Error("Failed to fetch habit items.");
  }

  return data || [];
}

// 新しい習慣項目を作成 (Create)
export async function createHabitItem(
  userId: number,
  itemData: Omit<
    HabitItem,
    | "id"
    | "user_id"
    | "updated_at"
    | "created_at"
    | "delete_flag"
    | "visible_flag"
  >
): Promise<HabitItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habit_items")
    .insert([{ ...itemData, user_id: userId }]) // user_id を付与
    .select()
    .single(); // 挿入したレコードを返す

  if (error) {
    console.error("Error creating habit item:", error);
    throw new Error("Failed to create habit item.");
  }

  // revalidatePath("/habit-items"); // データ変更後にキャッシュを更新
  revalidatePath("/test/itemmentenance"); // ★ データ変更があったページのキャッシュをクリア

  console.log("Created habit item:", data); // デバッグ用
  return data as HabitItem; // ★ 取得したデータを HabitItem 型として返す
}

// 既存の習慣項目を更新 (Update)
export async function updateHabitItem(
  id: number,
  itemData: Partial<Omit<HabitItem, "id" | "user_id" | "created_at">>
): Promise<HabitItem> {
  const supabase = await createClient();

  // updated_at は自動更新されるはずだが、明示的にセットしても良い
  const updateData = { ...itemData, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("habit_items")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating habit item:", error);
    throw new Error("Failed to update habit item.");
  }

  revalidatePath("/habit-items");
  return data;
}

// 習慣項目を論理削除 (Delete)
export async function deleteHabitItem(id: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("habit_items")
    .update({ delete_flag: true, updated_at: new Date().toISOString() }) // delete_flag を true に
    .eq("id", id);

  if (error) {
    console.error("Error deleting habit item:", error);
    throw new Error("Failed to delete habit item.");
  }

  revalidatePath("/habit-items");
}

/**
 * habit_item_tree テーブルの親子関係と順序を一括で更新 (upsert) します。
 * @param updates 更新データの配列 { item_id: number, parent_id: number | null, order_no: number }[]
 */
export async function updateHabitItemTreeOrder(
  updates: { item_id: number; parent_id: number | null; order_no: number }[]
) {
  console.log(
    `[Action] updateHabitItemTreeOrder called with ${updates.length} updates.`
  );
  if (!updates || updates.length === 0) {
    console.log("[Action] No updates provided.");
    return;
  }
  const supabase = await createClient();

  // upsert を使って、存在すれば更新、存在しなければ挿入する
  const { error } = await supabase.from("habit_item_tree").upsert(
    updates,
    { onConflict: "item_id" } // item_id が競合した場合に update する
  );

  if (error) {
    console.error("Error upserting habit_item_tree:", error);
    throw new Error("Failed to update habit item tree order.");
  }
  console.log("[Action] updateHabitItemTreeOrder completed successfully.");
  revalidatePath("/habit-items"); // 関連ページのキャッシュをクリア
}

/**
 * 指定された ID の習慣項目を物理的に削除します。
 * (外部キー制約 ON DELETE CASCADE により、関連する habit_item_tree も削除される想定)
 * @param id 削除する習慣項目の ID
 */
export async function deleteHabitItemPhysically(id: number) {
  console.log(`[Action] deleteHabitItemPhysically called for id: ${id}`);
  const supabase = await createClient();

  const { error } = await supabase.from("habit_items").delete().eq("id", id);

  if (error) {
    console.error("Error deleting habit item physically:", error);
    throw new Error("Failed to delete habit item physically.");
  }
  console.log(`[Action] deleteHabitItemPhysically successful for id: ${id}`);
  revalidatePath("/habit-items"); // 関連ページのキャッシュをクリア
}
