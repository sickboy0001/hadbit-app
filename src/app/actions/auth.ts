"use server";

import { createClient } from "@/util/supabase/server"; // サーバー用クライアントのパスを確認してください
import { redirect } from "next/navigation"; // 必要に応じてリダイレクトなどを追加
// import { cookies } from "next/headers";
// import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
// import { Database } from "@/types/supabase"; // 必要に応じてインポート

export async function signIn(username: string, password: string) {
  // const cookieStore = cookies(); // ★ cookies() を呼び出す
  // // ★ createServerActionClient に { cookies: () => cookieStore } を渡す
  // const supabase = createServerActionClient<Database>({
  //   cookies: () => cookieStore,
  // });

  const supabase = await createClient(); // ★ server.ts の createClient を使う
  const { error } = await supabase.auth.signInWithPassword({
    email: username,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    // エラーハンドリング: エラーメッセージを返すか、リダイレクトするなど
    return { error: "ログインに失敗しました。" }; // 例: エラーオブジェクトを返す
  }

  return { success: true }; // 成功を示すオブジェクトを返す
}

export async function signOut() {
  // const cookieStore = cookies();
  // const supabase = createServerActionClient<Database>({
  //   cookies: () => cookieStore,
  // }); // ★ 同様に cookies を渡す
  const supabase = await createClient(); // ★ 同様に server.ts の createClient を使う
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
  }
  // signOut 後は router.refresh() などでクライアントを更新する必要がある
}
