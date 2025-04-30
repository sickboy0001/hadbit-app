## テーブルデザイン
### ■ER図

[Alt text](er.drawio.png)


### ■テーブル一覧
- ツリー構造 ntree
- 習慣化項目 hadit_item
- 習慣化項目入力補足 hadit_item_input
- 実施記録 hadit_done
- 実施記録入力補足 hadit_done_input

### ■テーブル詳細
#### ▼ツリー構造 ntree
ツリー構造の取得  
|pk|name|type|description|
|-|-|-|-|
|*|id|integer|-|
|FK|user_id|integer|-|
|FK|parent_id|integer|-|
||order_no|integer|-|

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


#### ▼習慣化項目 hadit_item
習慣化項目  
習慣化したい項目を登録
|pk|name|type|description|
|-|-|-|-|
|*|id|integer|-|
|FK|user_id|integer|-|
||name|string|-|
||short_name|string|-|
||description|string|-|
||order_no|integer|-|
||delete_flg|bool|削除フラグ（True:削除済み）|
||create_at|datetime|-|
||update_at|datetime|-|



#### ▼習慣化項目入力補足 hadit_item_input
習慣化項目に対する補足入力スペースの定義  
ここで定義しておけば、実施記録時に、入力のInputが出てくる。
|pk|name|type|description|
|-|-|-|-|
|*|id|integer|-|
|FK|item_id|integer|-|
||order_no|integer|表示順|
||name|string|名前|
||before_text|string|入力の前置詞（「￥」など）|
||after_text|string|入力の後置詞（「円」など）|
||size|number|サイズ、テキストボックスのサイズ|
||number_flg|bool|true:数字、false:自由入力|
||delete_flg|bool|削除フラグ（True:削除済み）|
||create_at|datetime|-|
||update_at|datetime|-|



#### ▼実施記録 hadit_done
実施した記録の登録
|pk|name|type|description|
|-|-|-|-|
|*|id|integer|-|
|FK|user_id|integer|-|
||delete_flg|bool|削除フラグ（True:削除済み）|
||current_at|datetime|-|
||update_at|datetime|-|

#### ▼実施記録入力補足
実施した記録の登録の保続。  
体重や、距離、場所などで利用する。
|pk|name|type|description|
|-|-|-|-|
|*|id|integer|-|
|FK|done_id|integer|-|
|FK|item_input_id|integer|hadit_item_input.id|
||value|string|値|
||delete_flg|bool|削除フラグ（True:削除済み）|
||create_at|datetime|-|
||update_at|datetime|-|

