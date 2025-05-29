"use server";

import { createClient } from "@/util/supabase/server";

export interface DbUserSettingConfig {
  id: number; // 主キー、自動インクリメント
  user_id: number;
  log_summary_settings: object; // jsonb型は通常オブジェクトとして扱います
  type: string;
  updated_at: string; // ISO 8601 形式のタイムスタンプ文字列
  created_at: string; // ISO 8601 形式のタイムスタンプ文字列
}

export async function readUserSettingConfig(
  userId: number,
  type: string
): Promise<DbUserSettingConfig | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_setting_configs")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .maybeSingle(); // 結果が1件または0件であることを期待
  if (error) {
    console.error("Error reading user setting config:", error);
    throw new Error(
      `Failed to fetch user setting config for type ${type}: ${error.message}`
    );
  }
  return data;
}

export async function upsertUserSettingConfig(
  userId: number,
  type: string,
  settings: object // JSONオブジェクトを受け取る
): Promise<DbUserSettingConfig> {
  const supabase = await createClient();

  const existingConfig = await readUserSettingConfig(userId, type);

  if (existingConfig) {
    // 設定が存在する場合: Update
    const { data, error } = await supabase
      .from("user_setting_configs")
      .update({
        log_summary_settings: settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingConfig.id) // 主キーで更新
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating user setting config (within upsert logic):",
        error
      );
      throw new Error(`Failed to update user setting config: ${error.message}`);
    }
    if (!data) {
      throw new Error(
        "Update operation (within upsert logic) did not return data."
      );
    }
    return data;
  } else {
    // 設定が存在しない場合: Insert
    const { data, error } = await supabase
      .from("user_setting_configs")
      .insert({
        user_id: userId,
        type: type,
        log_summary_settings: settings,
        // created_at と updated_at はDBのデフォルト値に任せる
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Error inserting user setting config (within upsert logic):",
        error
      );
      throw new Error(`Failed to insert user setting config: ${error.message}`);
    }
    if (!data) {
      throw new Error(
        "Insert operation (within upsert logic) did not return data."
      );
    }
    return data;
  }
}

export async function updateUserSettingConfigById(
  configId: number,
  settings: object // JSONオブジェクトを受け取る
): Promise<DbUserSettingConfig> {
  const supabase = await createClient();

  const configToUpdate = {
    log_summary_settings: settings,
    updated_at: new Date().toISOString(), // 明示的に更新日時を設定
  };

  const { data, error } = await supabase
    .from("user_setting_configs")
    .update(configToUpdate)
    .eq("id", configId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user setting config by ID:", error);
    throw new Error(
      `Failed to update user setting config by ID ${configId}: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      `Update operation did not return data. Config with id ${configId} might not exist.`
    );
  }
  return data;
}

export async function deleteUserSettingConfig(
  userId: number,
  type: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("user_setting_configs")
    .delete({ count: "exact" }) // countオプションで削除件数を取得
    .eq("user_id", userId)
    .eq("type", type);

  if (error) {
    console.error("Error deleting user setting config:", error);
    throw new Error(`Failed to delete user setting config: ${error.message}`);
  }
  return count !== null && count > 0;
}
