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
    const fetchUser = async () => {
      console.log("AuthProvider: Fetching user on mount/reload..."); // ★ デバッグログ追加
      const { data } = await supabase.auth.getUser();
      console.log("AuthProvider: supabase.auth.getUser() result:", data); // ★ デバッグログ追加
      if (data.user === null || data.user.email === null) {
        setLoading(false);
        console.log("AuthProvider: No user found initially or email is null."); // ★ デバッグログ追加
        return;
      }
      const user: User = data.user; // Supabase の User オブジェクトを自分の定義した User インターフェースにキャスト
      if (user.email != undefined) {
        user.userid = await readUserId(user.email);
        const parsedUserId = user.userid || 0; //parseInt( || 0);
        [user.username, user.comment] = await getUserNameComment(
          parsedUserId,
          data.user.email
        );
        user.isSuperUser = isSuperUser(user.email);
        // console.log("AuthProvider: User details fetched:", user); // ★ デバッグログ追加
      }

      // setUser(data.user ?? null);
      setUser(user ?? null); // ★ 拡張した user オブジェクトをセット
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // ★ onAuthStateChange が呼ばれたときのログ
        // console.log("AuthProvider: Auth state changed:", _event, session);
        setUser(session?.user ?? null);
        setLoading(false); // 状態変化後もローディング解除
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
