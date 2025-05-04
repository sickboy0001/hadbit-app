# テーブルデザイン
## ER図
[Alt text](er.drawio.png)

## 補足
```
対象の親を持つ
親がないものは０
その親の中での表示順をもつ

1:今日の天気は？
>2:晴れじゃね？
>3:いや雨でしょう？
>>4:昼からは雨確定
5:明日の天気

PT1:2を5の下に移動したとき
２の親IDの変更（1→5）
３の表示順の更新（２→１）

PT2:２を４の下に移動したとき
２の親ID変更（1→3）
３の標準j変更（２→１）

PT3:4を5の下に移動したとき
4の親ID変更（3→5）

PT4:5を2の下に移動したとき
5の親ID変更（0→2）
```

## テーブル一覧

1.  **`habit_item_tree`**: 習慣項目のツリー構造を管理
2.  **`habit_items`**: 習慣項目そのものの情報を管理
3.  **`habit_logs`**: 習慣項目の実行記録を管理
4.  **`habit_item_fields`**: 習慣項目実行時の入力項目の定義を管理
5.  **`habit_log_fields`**: 習慣項目実行時に入力された値を管理

## テーブル定義


### 1. `habit_item_tree`

**役割:** 習慣項目の親子関係や順序を管理する汎用的なツリー構造テーブル

**列:**


| 列名       | 型                      | 主キー | NULL | デフォルト | 説明                                           |
|------------|-------------------------|--------|------|------------|------------------------------------------------|
| `id`       | serial                  | YES    | NO   |            | 一意のID（自動インクリメント）                     |
| `parent_id`| INTEGER                 |        | YES  |            | 親ノードのID（`habit_item_tree`テーブルの`id`を参照） |
| `order_no` | INTEGER                 |        | YES  |            | 同じ階層内での順序                               |


**インデックス:**

* `idx_habit_item_tree_parent_id`: `parent_id` カラムに対する検索を高速化するためのインデックス

### 2. `habit_items`

**役割:** 習慣化したい項目そのものを管理するテーブル

**列:**


| 列名         | 型                           | 主キー | NULL | デフォルト      | 説明                                               |
|--------------|------------------------------|--------|------|-----------------|----------------------------------------------------|
| `id`         | serial                       | YES    | NO   |                 | 一意のID（自動インクリメント）                         |
| `user_id`    | INTEGER                      |        | NO   |                 | 習慣項目を作成したユーザーのID（外部キー - `users`テーブルなどを想定） |
| `name`       | TEXT                         |        | NO   |                 | 習慣項目の名前                                       |
| `short_name` | TEXT                         |        | YES  |                 | 習慣項目の短い名前（表示用など）                     |
| `description`| TEXT                         |        | YES  |                 | 習慣項目の詳細な説明                               |
| `parent_flag`| BOOLEAN                      |        | YES  | FALSE           | 親項目であるかどうかを示すフラグ                       |
| `public_flag`| BOOLEAN                      |        | YES  | FALSE           | 公開設定を示すフラグ                               |
| `visible_flag`| BOOLEAN                      |        | YES  | TRUE            | 表示設定を示すフラグ（論理削除ではない表示制御用）   |
| `delete_flag`| BOOLEAN                      |        | YES  | FALSE           | 論理削除フラグ                                     |
| `updated_at` | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 最終更新日時                                         |
| `created_at` | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 作成日時                                           |


**インデックス:**

* `idx_habit_items_user_id`: `user_id` カラムに対する検索を高速化するためのインデックス

### 3. `habit_logs`

**役割:** 習慣項目の実行記録を管理するテーブル

**列:**

| 列名       | 型                           | 主キー | NULL | デフォルト      | 説明                                                 |
|------------|------------------------------|--------|------|-----------------|------------------------------------------------------|
| `id`       | serial                       | YES    | NO   |                 | 一意のID（自動インクリメント）                           |
| `user_id`  | INTEGER                      |        | NO   |                 | 実行記録を作成したユーザーのID（`habit_items`テーブルの`user_id`と関連） |
| `item_id`  | INTEGER                      |        | NO   |                 | 実行された習慣項目のID（外部キー - `habit_items`テーブルの`id`を参照） |
| `done_at`  | TIMESTAMP WITHOUT TIME ZONE  |        | YES  |                 | 習慣を実行した日時                                     |
| `updated_at` | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 最終更新日時                                           |
| `created_at` | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 作成日時                                             |


**インデックス:**

* `idx_habit_logs_user_id`: `user_id` カラムに対する検索を高速化するためのインデックス
* `idx_habit_logs_item_id`: `item_id` カラムに対する検索を高速化するためのインデックス

### 4. `habit_item_fields`

**役割:** 習慣項目を実行する際に記録する追加の入力項目の定義を管理するテーブル（例：体重、時間、回数など）

**列:**

| 列名         | 型                           | 主キー | NULL | デフォルト      | 説明                                                               |
|--------------|------------------------------|--------|------|-----------------|--------------------------------------------------------------------|
| `id`         | serial                       | YES    | NO   |                 | 一意のID（自動インクリメント）                                     |
| `item_id`    | INTEGER                      |        | NO   |                 | この入力項目が関連する習慣項目のID（外部キー - `habit_items`テーブルの`id`を参照） |
| `order_no`   | INTEGER                      |        | NO   |                 | 同じ習慣項目内での入力項目の表示順序                               |
| `name`       | TEXT                         |        | YES  |                 | 入力項目の表示名（例：「体重」「時間」「回数」）                     |
| `before_text`| TEXT                         |        | YES  |                 | 入力フィールドの前に表示するテキスト（例：「目標：」）               |
| `after_text` | TEXT                         |        | YES  |                 | 入力フィールドの後に表示するテキスト（例：「kg」「分」「回」）     |
| `size`       | INTEGER                      |        | YES  |                 | 入力フィールドのサイズや桁数などのヒント                           |
| `type`       | TEXT                         |        | YES  |                 | 入力フィールドの型（例：'number', 'text', 'time'）                  |
| `is_numeric` | BOOLEAN                      |        | YES  | FALSE           | 数値入力かどうかを示すフラグ                                       |
| `updated_at` | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 最終更新日時                                                         |
| `created_at` | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 作成日時                                                           |


**インデックス:**

* `idx_habit_item_fields_item_id`: `item_id` カラムに対する検索を高速化するためのインデックス

### 5. `habit_log_fields`

**役割:** 習慣項目の実行記録時に実際に入力された値を管理するテーブル

**列:**

| 列名           | 型                           | 主キー | NULL | デフォルト      | 説明                                                                 |
|----------------|------------------------------|--------|------|-----------------|----------------------------------------------------------------------|
| `id`           | serial                       | YES    | NO   |                 | 一意のID（自動インクリメント）                                       |
| `log_id`       | INTEGER                      |        | NO   |                 | この入力値が関連する実行記録のID（外部キー - `habit_logs`テーブルの`id`を参照） |
| `item_field_id`| INTEGER                      |        | NO   |                 | 対応する入力項目の定義のID（外部キー - `habit_item_fields`テーブルの`id`を参照） |
| `name`         | TEXT                         |        | YES  |                 | 入力項目の表示名（`habit_item_fields`テーブルの`name`をコピーして保持する場合など） |
| `before_text`  | TEXT                         |        | YES  |                 | 入力フィールドの前に表示するテキスト（`habit_item_fields`テーブルからコピー） |
| `value`        | TEXT                         |        | YES  |                 | 実際に入力された値                                                   |
| `type`         | TEXT                         |        | YES  |                 | 入力フィールドの型（`habit_item_fields`テーブルからコピー）           |
| `after_text`   | TEXT                         |        | YES  |                 | 入力フィールドの後に表示するテキスト（`habit_item_fields`テーブルからコピー） |
| `update_at`    | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 最終更新日時                                                           |
| `create_at`    | TIMESTAMP WITHOUT TIME ZONE  |        | NO   | CURRENT_TIMESTAMP | 作成日時                                                             |

**インデックス:**

* `idx_habit_log_fields_done_id`: `log_id` カラムに対する検索を高速化するためのインデックス
* `idx_habit_log_fields_item_input_id`: `item_field_id` カラムに対する検索を高速化するためのインデックス

---