"use client"; // Context Provider はクライアントコンポーネントである必要がある

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { User } from "@/types/user";
import { getUserNameComment, readUserId } from "@/app/actions/user/read";
import { isSuperUser } from "@/lib/user";
import { createClient } from "@/util/supabase/client"; // ★ client.ts の createClient をインポート

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // 必要であれば他の認証関連の関数を追加 (例: signOut)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const supabase = createClientComponentClient<Database>();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // 拡張ユーザー情報を取得し、状態を更新する関数
    const updateUserState = async (supabaseUser: User | null) => {
      // Supabaseからユーザー情報が取得できない、またはメールアドレスがない場合は、
      // アプリケーションの拡張機能にとっては完全に認証されていないとみなす
      // if (supabaseUser === null || supabaseUser.email === null) {
      if (supabaseUser === null || supabaseUser?.email === null) {
        setUser(null);
        setLoading(false);
        console.log(
          "AuthProvider: Supabaseユーザーが存在しないか、メールアドレスがnullです。ユーザーをnullに設定しました。"
        );
        return;
      }

      // Supabaseのユーザーオブジェクトを元に拡張する
      const extendedUser: User = { ...supabaseUser }; // ここでは supabaseUser とその email は null ではない

      if (extendedUser.email == undefined) {
        console.error(
          "AuthProvider: ユーザーの取得に失敗しました。extendedUser.email == undefinedです。"
        );
        setUser(supabaseUser);
        setLoading(false);
        return;
      }
      try {
        // 拡張プロパティを取得して割り当てる
        extendedUser.userid = await readUserId(extendedUser.email);
        const parsedUserId = extendedUser.userid || 0;
        [extendedUser.username, extendedUser.comment] =
          await getUserNameComment(parsedUserId, extendedUser.email);
        extendedUser.isSuperUser = isSuperUser(extendedUser.email);
        // console.log("AuthProvider: ユーザー詳細を取得/更新しました:", extendedUser);
        setUser(extendedUser);
      } catch (error) {
        console.error(
          "AuthProvider: 拡張ユーザー詳細の取得中にエラーが発生しました:",
          error
        );
        // 拡張に失敗した場合は、基本的なSupabaseユーザーを設定するフォールバック
        // これにより、ユーザーは基本的なレベルではログインしているとみなされる
        setUser(supabaseUser);
      } finally {
        setLoading(false);
      }
    };

    // マウント時の初期ユーザー取得
    const fetchInitialUser = async () => {
      setLoading(true);
      console.log("AuthProvider: マウント時に初期ユーザーを取得しています...");
      // Supabaseのユーザー型は若干異なる場合があるためキャストする
      const {
        data: { user: supabaseAuthUser },
      } = await supabase.auth.getUser();
      console.log(
        "AuthProvider: supabase.auth.getUser() の結果:",
        supabaseAuthUser
      );
      await updateUserState(supabaseAuthUser as User | null);
    };

    fetchInitialUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true); // 認証状態遷移中はローディングを示す
        // console.log("AuthProvider: 認証状態が変更されました:", _event, session);
        // Supabaseのsession.user型は若干異なる場合があるためキャストする
        await updateUserState(session?.user as User | null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  // ローディング状態も返すように修正
  return context;
};
