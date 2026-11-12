import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { userDataQuery } from "@/lib/user-data";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { userId: data.user.id };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(userDataQuery(context.userId)),
  pendingComponent: Loading,
  component: AuthenticatedLayout,
});

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dots">
      <div className="animate-bounce-soft font-display text-2xl font-bold">Memuat… 🚀</div>
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
