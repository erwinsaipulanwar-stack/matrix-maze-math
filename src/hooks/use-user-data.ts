import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";
import { userDataQuery } from "@/lib/user-data";
import { computeBadges, computePoints, levelFor } from "@/lib/progress";

export function useUserId() {
  return useRouteContext({ from: "/_authenticated" }).userId;
}

export function useUserData() {
  const userId = useUserId();
  const { data } = useSuspenseQuery(userDataQuery(userId));
  const stats = useMemo(() => {
    const points = computePoints(data);
    return {
      points,
      level: levelFor(points),
      badges: computeBadges(data, points),
      doneLessons: new Set(data.lessons.map((l) => l.lesson_id)),
      bestEval: Math.max(0, ...data.evaluations.map((e) => e.score)),
    };
  }, [data]);
  return { userId, ...data, ...stats };
}
