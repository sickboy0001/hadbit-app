"use client";

import {
  readUserSettingConfig,
  upsertUserSettingConfig,
} from "@/app/actions/user_setting_configs"; // readUserSettingConfig をインポート
import { HabitLogSummarySettings } from "@/types/habit/LogSumsSetting";
import { addNewSummaryToSettings } from "./HabitSettingService";

/**
 * ユーザーのサマリー設定を読み込むか、存在しない場合はダミー設定を生成します。
 * @param userId ユーザーID
 * @param settingType 設定タイプ (例: "habit_log_summary_table")
 * @param habitItemIds ダミー設定生成時に使用する習慣アイテムIDのリスト
 * @returns HabitLogSummarySettings またはエラー時にフォールバックとしてのダミー設定
 */
export async function getLogSummarySettingsOrCreateDummy(
  userId: number,
  settingType: string,
  allHabitItemIds: number[]
): Promise<HabitLogSummarySettings> {
  try {
    const existingConfig = await readUserSettingConfig(userId, settingType);
    if (existingConfig && existingConfig.log_summary_settings) {
      return existingConfig.log_summary_settings as HabitLogSummarySettings;
    } else {
      console.log(
        `[DAO/DaoHabitLog] No settings found for ${settingType}, creating dummy settings for userId: ${userId}.`
      );
      // DBに設定が存在しない場合、ダミー設定を生成して返す
      // (オプション: ここでダミー設定をDBに保存することも可能だが、今回は返却のみ)
      const newOrderId = String(crypto.randomUUID());
      return addNewSummaryToSettings(null, newOrderId, allHabitItemIds);
    }
  } catch (error) {
    console.error(
      `[DAO/DaoHabitLog] Failed to load or create LogSummarySettings for userId: ${userId}, type: ${settingType}:`,
      error
    );
    // エラー時にもフォールバックとしてダミー設定を返す
    const newOrderId = String(crypto.randomUUID());
    return addNewSummaryToSettings(null, newOrderId, allHabitItemIds);
  }
}

/**
 * ユーザーのサマリー設定をデータベースに永続化します。
 * @param userId ユーザーID
 * @param settingType 設定タイプ (例: "habit_log_summary_table")
 * @param settings 保存するサマリー設定オブジェクト
 * @returns 保存が成功した場合は true、失敗した場合は false
 */
export async function persistLogSummarySettings(
  userId: number,
  settingType: string,
  settings: HabitLogSummarySettings
): Promise<boolean> {
  try {
    console.log(
      `[DAO/DaoHabitSetting] Persisting habitLogSummarySettings to DB for userId: ${userId}, type: ${settingType}:`,
      settings
    );
    await upsertUserSettingConfig(userId, settingType, settings);
    // console.log("[DAO/DaoHabitSetting] User settings updated in DB.");
    return true;
  } catch (error) {
    console.error(
      `[DAO/DaoHabitSetting] Failed to update user settings in DB for userId: ${userId}, type: ${settingType}:`,
      error
    );
    // UI側でtoastを出すため、ここではエラーを再スローするか、falseを返すか選択
    // 今回はfalseを返して、UI側でエラーメッセージを制御する
    return false;
  }
}
