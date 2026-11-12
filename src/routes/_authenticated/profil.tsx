import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/use-user-data";
import { useSignOut } from "@/hooks/use-sign-out";
import { userDataQuery } from "@/lib/user-data";
import { LESSONS } from "@/lib/lessons";
import { LEVELS } from "@/lib/progress";
import { AvatarBubble } from "@/components/Avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { PageTitle } from "@/components/AppShell";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Profil — Mahtrix" },
      { name: "description", content: "Atur avatar dan nama panggilan, lihat level dan semua lencanamu di Mahtrix." },
      { property: "og:title", content: "Profil — Mahtrix" },
      { property: "og:description", content: "Avatar, level, dan koleksi lencana belajar matriksmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profil,
});

function Profil() {
  const { userId, profile, points, level, badges, doneLessons, practice, evaluations, bestEval } = useUserData();
  const queryClient = useQueryClient();
  const signOut = useSignOut();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar ?? "fox");
  const changed = nickname.trim() !== (profile?.nickname ?? "") || avatar !== (profile?.avatar ?? "fox");
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ nickname: nickname.trim().slice(0, 24), avatar })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userDataQuery(userId).queryKey });
      toast.success("Profil tersimpan! ✨");
    },
    onError: () => toast.error("Profil gagal disimpan. Periksa koneksimu."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (nickname.trim().length < 2) {
      toast.error("Nama panggilan minimal 2 huruf, ya!");
      return;
    }
    save.mutate();
  }

  return (
    <div className="space-y-5">
      <PageTitle emoji="😊" title="Profil" subtitle="Atur dirimu dan lihat koleksi lencanamu" />

      <section className="pop-card flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
        <AvatarBubble id={avatar} size="xl" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-3xl font-bold">{profile?.nickname ?? "Teman"}</h2>
          <p className="font-semibold text-muted-foreground">@{profile?.username}</p>
          <div className="mt-3 rounded-2xl bg-sunny-soft p-3 text-left">
            <div className="flex items-center justify-between font-display font-semibold">
              <span>
                {level.emoji} {level.name}
              </span>
              <span className="text-sm">⭐ {points}</span>
            </div>
            <ProgressBar value={level.progress} className="mt-2" barClassName="bg-coral" label="Progres level" />
            <p className="mt-1 text-xs text-muted-foreground">
              {level.next ? `${level.next.min - points} poin lagi menuju ${level.next.name}` : "Level tertinggi! Keren!"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3" aria-label="Statistik">
        <Stat emoji="📖" value={`${doneLessons.size}/${LESSONS.length}`} label="Materi" tone="bg-coral-soft" />
        <Stat emoji="🧩" value={String(practice.length)} label="Latihan" tone="bg-sunny-soft" />
        <Stat emoji="📝" value={evaluations.length ? String(bestEval) : "–"} label="Nilai terbaik" tone="bg-teal-soft" />
      </section>

      <section className="pop-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Lencana</h2>
          <span className="font-display font-bold text-teal-shade">
            {unlockedCount}/{badges.length}
          </span>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {badges.map((b) => (
            <li
              key={b.id}
              className={cn(
                "flex flex-col items-center rounded-3xl border-2 p-3 text-center",
                b.unlocked ? "border-sunny bg-sunny-soft" : "border-dashed border-border bg-muted/50",
              )}
            >
              <span className={cn("text-4xl", !b.unlocked && "opacity-30 grayscale")} aria-hidden>
                {b.emoji}
              </span>
              <span className="mt-1 font-display font-bold leading-tight">{b.name}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">{b.desc}</span>
              <span className="sr-only">{b.unlocked ? "Sudah didapat" : "Belum didapat"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pop-card p-5">
        <h2 className="text-xl font-bold">Tangga level</h2>
        <ol className="mt-3 space-y-2">
          {LEVELS.map((l, i) => (
            <li
              key={l.name}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 font-display font-semibold",
                i === level.index ? "bg-coral text-primary-foreground" : i < level.index ? "bg-teal-soft" : "bg-muted/60",
              )}
            >
              <span className="text-2xl">{l.emoji}</span>
              <span className="flex-1">{l.name}</span>
              <span className="text-sm opacity-80">{l.min} poin</span>
            </li>
          ))}
        </ol>
      </section>

      <form onSubmit={onSubmit} className="pop-card space-y-4 p-5">
        <h2 className="text-xl font-bold">Ubah profil</h2>
        <div className="space-y-2">
          <Label htmlFor="nickname" className="font-display text-base">
            Nama panggilan
          </Label>
          <Input id="nickname" value={nickname} maxLength={24} onChange={(e) => setNickname(e.target.value)} />
        </div>
        <div className="space-y-2">
          <p className="font-display text-base font-semibold">Avatar</p>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>
        <Button type="submit" variant="teal" size="lg" className="w-full" disabled={!changed || save.isPending}>
          <Save /> {save.isPending ? "Menyimpan…" : "Simpan perubahan"}
        </Button>
      </form>

      <Button variant="outline" size="lg" className="w-full" onClick={signOut}>
        <LogOut /> Keluar
      </Button>
    </div>
  );
}

function Stat({ emoji, value, label, tone }: { emoji: string; value: string; label: string; tone: string }) {
  return (
    <div className={cn("rounded-3xl p-3 text-center sm:p-4", tone)}>
      <div className="text-2xl">{emoji}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold text-muted-foreground sm:text-sm">{label}</div>
    </div>
  );
}
