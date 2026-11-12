import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export const userDataQuery = (userId: string) =>
  queryOptions({
    queryKey: ["user-data", userId],
    queryFn: async () => {
      const [profile, lessons, practice, evaluations] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId),
        supabase
          .from("practice_attempts")
          .select("id, topic_id, correct, total, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("evaluation_attempts")
          .select("id, correct, total, score, duration_seconds, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);
      for (const r of [profile, lessons, practice, evaluations]) if (r.error) throw r.error;
      return {
        profile: profile.data,
        lessons: lessons.data ?? [],
        practice: practice.data ?? [],
        evaluations: evaluations.data ?? [],
      };
    },
  });
