import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User extends SupabaseUser {
  userid?: number;
  username?: string;
  comment?: string;
  isSuperUser?: boolean;
}
