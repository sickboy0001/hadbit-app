
CREATE TABLE IF NOT EXISTS public.user_setting_configs (
    id serial PRIMARY KEY, -- PostgreSQLの自動インクリメント型に変更
    user_id INTEGER NOT NULL, -- user_id
    log_summary_settings jsonb NOT NULL,
    type TEXT NOT NULL, -- habit_log_summary_table
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP -- 型とデフォルト値を変更
);

-- スキーマの使用権限
grant usage on schema "public" to anon;
grant usage on schema "public" to authenticated;

-- テーブルへのアクセス権限 (SupabaseのRLSを使う場合はより詳細な設定が必要)
GRANT SELECT, INSERT, UPDATE , DELETE  ON ALL TABLES IN SCHEMA "public" TO authenticated;
GRANT SELECT, INSERT, UPDATE , DELETE ON ALL TABLES IN SCHEMA "public" TO anon;

GRANT USAGE ON SEQUENCE public.user_setting_configs_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.user_setting_configs_id_seq TO authenticated;
