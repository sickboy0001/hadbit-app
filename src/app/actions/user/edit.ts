"use server";
// import { supabase } from "@/utils/supabase/supabase";
import { createClient } from "@/util/supabase/server";

const supabase = await createClient();

export const registUserInfo = async (
  user_id: number,
  name: string,
  comment: string
) => {
  //update
  const updatedata = await updateUserInfo(user_id, name, comment);
  //nodata
  if (!updatedata) {
    //insert
    await insertUserInfo(user_id, name, comment);
  }
  return;
};

const updateUserInfo = async (
  user_id: number,
  name: string,
  comment: string
) => {
  //update
  const { data: res, error: putError } = await supabase
    .from("user_info")
    .update({
      name: name,
      comment: comment,
    })
    .eq("user_id", user_id)
    .eq("delete_flg", false)
    .select()
    .single();

  if (putError) {
    console.log("Falte_Update_Try_Insert", putError);
  }

  return res;
};

const insertUserInfo = async (
  user_id: number,
  name: string,
  comment: string
) => {
  //update
  const { data: res, error: putError } = await supabase
    .from("user_info")
    .insert([
      {
        user_id: user_id,
        name: name,
        comment: comment,
      },
    ]);

  if (putError) {
    console.log("■■■■データの登録失敗", putError);
  }

  return res;
};
