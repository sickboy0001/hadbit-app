import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
// import { AuthProvider } from "@/contexts/AuthContext"; // ★ AuthProvider をインポート
// import { cookies, ReadonlyRequestCookies } from "next/headers"; // ★ ReadonlyRequestCookies を追加

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // 型アサーションを追加して Promise 誤認エラーを回避
          // return (cookieStore as any).get(name)?.value;
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // ReadonlyRequestCookies に 'set' が無いため型アサーションが必要
            // try/catch がサーバーコンポーネントでのエラーを処理する
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (cookieStore as any).set({ name, value, ...options });
          } catch {
            // console.log(error);
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // ReadonlyRequestCookies に 'set' (deleteの代わり) が無いため型アサーションが必要
            // try/catch がサーバーコンポーネントでのエラーを処理する
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (cookieStore as any).set({ name, value: "", ...options });
          } catch {
            // console.log(error);
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
