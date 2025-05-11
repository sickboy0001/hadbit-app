"use server";

import { User } from "@/types/user";
import { createClient } from "@/util/supabase/server";

export const readUtilUser = async (): Promise<User | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    // セッションがない、または取得時にエラーが発生した場合
    if (error || !data?.user) {
      // "Auth session missing!" は通常の未ログイン状態なので、エラーログは出さない
      if (error && error.message !== "Auth session missing!") {
        console.error("Error fetching user in readUtilUser:", error.message);
      }
      return null; // 未ログインまたはエラー時は null を返す
    }

    // ユーザー情報が取得できた場合
    return data.user;
  } catch (e) {
    // createClient 自体でエラーが発生した場合など
    console.error("Unexpected error in readUtilUser:", e);
    return null;
  }
};
export const getUserNameComment = async (
  user_id: number,
  email: string | undefined
) => {
  // console.log(`getUserNameComment:start:${String(user_id)}`);
  const supabase = await createClient();
  const { data: res, error } = await supabase
    .from("user_info")
    .select("name , comment")
    .eq("user_id", user_id)
    .eq("delete_flg", false)
    .single();

  // console.log(res);
  if (res === null) {
    if (email === undefined) {
      console.log(error);
      return ["nanashi", "nanashi"];
    }

    const defname = email.split("@").length > 0 ? email.split("@")[0] : email;
    return [defname, defname];
  }
  return [res?.name, res?.comment];
  // return ["12", "12"];

  // if (email.split("@").length > 0) {
  //   return email.split("@")[0];
  // } else {
  //   return email;
  // }
};

const InsertMailToId = async (email: string) => {
  // console.log("updateUserId:start");
  const supabase = await createClient();
  const { data: res, error } = await supabase.from("mail_to_id").insert([
    {
      mail: email,
    },
  ]);
  if (error) {
    console.log(res);
    console.log(error);
    console.log("InsertMailToId:isert faild", error);
  }
};

const getUserIdInserted = async (email: string) => {
  // console.log("const getUserIdInserted:start");
  const supabase = await createClient();
  const { data: res, error } = await supabase
    .from("mail_to_id")
    .select("id")
    .eq("mail", email)
    .limit(1);

  if (error) {
    console.log(error);
  }
  if (res == null || res?.length == 0) {
    return null;
  } else {
    return res[0].id;
  }
};
export const readUserId = async (email: string) => {
  let user_id = await getUserIdInserted(email);
  // console.log("getUserId new user_id insert :", user_id);
  if (!user_id) {
    // console.log("getUserId new user_id insert :", email);
    InsertMailToId(email);
    const insertUserId = await getUserIdInserted(email);
    if (insertUserId == null) {
      console.error("const getUserId:getUserIdInserted:faild");
    } else {
      user_id = insertUserId;
    }
  }
  return user_id;
};
