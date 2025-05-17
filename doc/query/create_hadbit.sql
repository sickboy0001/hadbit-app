-- 親子関係や順序を管理する汎用的なツリー構造テーブル
CREATE TABLE IF NOT EXISTS public.habit_item_tree (
    item_id INTEGER NOT NULL PRIMARY KEY,
    parent_id INTEGER,
    order_no INTEGER
);

ALTER TABLE public.habit_item_tree
ADD CONSTRAINT fk_habit_item_tree_item_id
FOREIGN KEY (item_id)
REFERENCES public.habit_items (id)
ON DELETE CASCADE  -- habit_items のレコードを削除する際、関連する habit_item_tree レコードも削除


-- 親IDでの検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_habit_item_tree_parent_id ON public.habit_item_tree(parent_id);

-- 習慣化したい項目 (Habit Item) を管理するテーブル
CREATE TABLE IF NOT EXISTS public.habit_items (
    id serial PRIMARY KEY, -- PostgreSQLの自動インクリメント型に変更
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    parent_flag BOOLEAN DEFAULT FALSE, -- デフォルト値を追加
    public_flag BOOLEAN DEFAULT FALSE, -- デフォルト値を追加
    visible_flag BOOLEAN DEFAULT TRUE, -- デフォルト値を追加 (通常は表示)
    delete_flag BOOLEAN DEFAULT FALSE, -- デフォルト値を追加 (論理削除用)
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    item_style TEXT -- マークや色などの表示スタイルをテキストで格納 (例: "◆", "red", "mark:◆;color:red")
);
-- ユーザーIDでの検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_habit_items_user_id ON public.habit_items (user_id);

-- - 既存の habit_items テーブルに item_style 列を追加 (存在しない場合のみ)
-- ALTER TABLE public.habit_items
-- ADD COLUMN IF NOT EXISTS item_style TEXT; -- マークや色などの表示スタイルをテキストで格納


-- 習慣項目の実行記録 (Done) を管理するテーブル
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id serial PRIMARY KEY, -- PostgreSQLの自動インクリメント型に変更
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    done_at TIMESTAMP WITHOUT TIME ZONE, -- 実行日時 (デフォルトは不要かも)
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    comment TEXT
);
-- ユーザーIDと項目IDでの検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_item_id ON public.habit_logs (item_id);

-- 習慣項目実行時に記録する入力項目 (例: 体重、時間など) の定義
CREATE TABLE IF NOT EXISTS public.habit_item_fields  (
    id serial PRIMARY KEY, -- PostgreSQLの自動インクリメント型に変更
    item_id INTEGER NOT NULL,
    order_no INTEGER NOT NULL,
    name TEXT,
    before_text TEXT,
    after_text TEXT,
    size INTEGER,
    type TEXT, -- 例: 'number', 'text', 'time'
    is_numeric BOOLEAN DEFAULT FALSE, -- デフォルト値を追加
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更

    -- FOREIGN KEY (item_id) REFERENCES public.habit_item(id) ON DELETE CASCADE -- 項目削除時に入力定義も削除
);
-- 項目IDでの検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_habit_item_fields_item_id ON public.habit_item_fields (item_id);

-- habit_done_input テーブル
-- 習慣項目実行時に記録された入力値
CREATE TABLE IF NOT EXISTS public.habit_log_fields (
    id serial PRIMARY KEY, -- PostgreSQLの自動インクリメント型に変更
    log_id INTEGER NOT NULL,
    item_field_id INTEGER NOT NULL,
    name TEXT,
    before_text TEXT,
    value TEXT,
    type TEXT,
    after_text TEXT,
    update_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    create_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP -- 型とデフォルト値を変更
    -- FOREIGN KEY (done_id) REFERENCES public.habit_done(id) ON DELETE CASCADE, -- 実行記録削除時に入力値も削除
    -- FOREIGN KEY (item_input_id) REFERENCES public.habit_item_input(id) ON DELETE CASCADE -- 入力定義削除時に入力値も削除
);
-- 実行記録IDと入力項目定義IDでの検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_habit_log_fields_done_id ON public.habit_log_fields (log_id);
CREATE INDEX IF NOT EXISTS idx_habit_log_fields_item_input_id ON public.habit_log_fields (item_field_id );


-- スキーマの使用権限
grant usage on schema "public" to anon;
grant usage on schema "public" to authenticated;

-- テーブルへのアクセス権限 (SupabaseのRLSを使う場合はより詳細な設定が必要)
GRANT SELECT, INSERT, UPDATE , DELETE  ON ALL TABLES IN SCHEMA "public" TO authenticated;
GRANT SELECT, INSERT, UPDATE , DELETE ON ALL TABLES IN SCHEMA "public" TO anon;

-- シーケンス (serialによる自動採番) の使用権限
-- GRANT USAGE ON SEQUENCE public.habit_item_tree_id_seq TO anon;
-- GRANT USAGE ON SEQUENCE public.habit_item_tree_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.habit_items_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.habit_items_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.habit_logs_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.habit_logs_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.habit_item_fields_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.habit_item_fields_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.habit_log_fields_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.habit_log_fields_id_seq TO authenticated;


/*
-- template

-- 習慣項目実行時に記録された入力値
CREATE TABLE IF NOT EXISTS public.habit_log_fields (
    id serial PRIMARY KEY, -- PostgreSQLの自動インクリメント型に変更
    log_id INTEGER NOT NULL,
    item_field_id INTEGER NOT NULL,
    name TEXT,
    before_text TEXT,
    value TEXT,
    type TEXT,
    after_text TEXT,
    update_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 型とデフォルト値を変更
    create_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP -- 型とデフォルト値を変更
);
-- 実行記録IDと入力項目定義IDでの検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_habit_log_fields_done_id ON public.habit_log_fields (log_id);
CREATE INDEX IF NOT EXISTS idx_habit_log_fields_item_input_id ON public.habit_log_fields (item_field_id );

-- スキーマの使用権限
grant usage on schema "public" to anon;
grant usage on schema "public" to authenticated;

-- テーブルへのアクセス権限 (SupabaseのRLSを使う場合はより詳細な設定が必要)
GRANT SELECT, INSERT, UPDATE , DELETE  ON ALL TABLES IN SCHEMA "public" TO authenticated;
GRANT SELECT, INSERT, UPDATE , DELETE ON ALL TABLES IN SCHEMA "public" TO anon;

-- シーケンス (serialによる自動採番) の使用権限
GRANT USAGE ON SEQUENCE public.habit_log_fields_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.habit_log_fields_id_seq TO authenticated;
*/