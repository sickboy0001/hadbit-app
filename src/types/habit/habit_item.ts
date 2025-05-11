export interface HabitItem {
  id: number;
  user_id: number;
  name: string;
  short_name?: string | null;
  description?: string | null;
  parent_flag?: boolean | null;
  public_flag?: boolean | null;
  visible_flag?: boolean | null;
  delete_flag?: boolean | null;
  updated_at: string; // ISO 8601 形式の文字列
  created_at: string; // ISO 8601 形式の文字列
}

// habit_item_tree の情報を含む HabitItem
export type HabitItemWithTreeInfo = HabitItem & {
  parent_id: number | null; // habit_item_tree.parent_id
  order_no: number | null; // habit_item_tree.order_no
};

// habit_item_tree の情報を含む HabitItem
export type HabitItemTree = {
  item_id: number; // habit_items.id
  parent_id: number | null; // habit_item_tree.parent_id
  order_no: number | null; // habit_item_tree.order_no
};
