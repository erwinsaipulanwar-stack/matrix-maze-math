import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { AvatarPicker } from "@/components/AvatarPicker";
import { friendlyAuthError, isValidUsername, normalizeUsername, usernameToEmail } from "@/lib/username";
import { cn } from "@/lib/utils";
import mascot from "@/assets/mascot-wave.png";

type Mode = "masuk" | "daftar";

const safeRedirect = (value: unknown) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : undefined;

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined; mode?: Mode | undefined } => ({
    redirect: safeRedirect(search["redirect"]),
    mode: search["mode"] === "daftar" ? "daftar" : undefined,
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/beranda" });
  },
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — Mahtrix" },
      { name: "description", content: "Masuk ke Mahtrix dengan username dan kata sandi untuk menyimpan progres belajarmu." },
      { property: "og:title", content: "Masuk atau Daftar — Mahtrix" },
      { property: "og:description", content: "Simpan progres belajar matriksmu dan kumpulkan lencana di Mahtrix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(search.mode ?? "masuk");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState("fox");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    if (search.redirect) router.history.push(search.redirect);
    else router.navigate({ to: "/beranda" });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const uname = normalizeUsername(username);
    if (!isValidUsername(uname)) {
      setError("Username 3–20 karakter, hanya huruf kecil, angka, atau garis bawah (_).");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (mode === "daftar") {
      if (nickname.trim().length < 2) {
        setError("Isi nama panggilanmu dulu, ya (minimal 2 huruf).");
        return;
      }
      if (password !== confirm) {
        setError("Konfirmasi kata sandi belum sama.");
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === "masuk") {
        const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(uname), password });
        if (error) throw error;
        toast.success("Selamat datang kembali! 🎉");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: usernameToEmail(uname),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: uname, nickname: nickname.trim().slice(0, 24), avatar },
          },
        });
        if (error) throw error;
        if (!data.session) throw new Error("Akun dibuat, silakan masuk.");
        toast.success(`Halo, ${nickname.trim()}! Akunmu sudah jadi 🎉`);
      }
      goNext();
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dots px-4 py-6">
      <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[1fr_1.1fr]">
        <div className="hidden text-center md:block">
          <img src={mascot} alt="" width={1024} height={1024} className="mx-auto w-72 animate-float" />
          <p className="mt-2 font-display text-2xl font-bold">“Ayo belajar bareng Mixi!”</p>
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between">
            <a href="/" aria-label="Kembali ke halaman awal">
              <Logo />
            </a>
            <img src={mascot} alt="" width={1024} height={1024} className="w-16 md:hidden" />
          </div>

          <div className="pop-card p-5 sm:p-7">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1" role="tablist">
              {(["masuk", "daftar"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={cn(
                    "rounded-xl py-2.5 font-display text-lg font-semibold transition-all",
                    mode === m ? "bg-card shadow-[0_3px_0_0_var(--border-shade)]" : "text-muted-foreground",
                  )}
                >
                  {m === "masuk" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-bold">
              {mode === "masuk" ? "Halo lagi! 👋" : "Buat akun barumu ✨"}
            </h1>
            <p className="mb-5 text-muted-foreground">
              {mode === "masuk"
                ? "Masuk untuk melanjutkan progres belajarmu."
                : "Cukup username dan kata sandi. Progresmu akan tersimpan."}
            </p>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="username" className="font-display text-base">Username</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="contoh: budi_matika"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  className="h-12 rounded-2xl border-2 bg-background text-base"
                  maxLength={20}
                />
              </div>

              {mode === "daftar" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="nickname" className="font-display text-base">Nama panggilan</Label>
                    <Input
                      id="nickname"
                      placeholder="contoh: Budi"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="h-12 rounded-2xl border-2 bg-background text-base"
                      maxLength={24}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-display text-base font-medium">Pilih avatarmu</span>
                    <AvatarPicker value={avatar} onChange={setAvatar} />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-display text-base">Kata sandi</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete={mode === "masuk" ? "current-password" : "new-password"}
                    placeholder="minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border-2 bg-background pr-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {mode === "daftar" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="font-display text-base">Ulangi kata sandi</Label>
                  <Input
                    id="confirm"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-12 rounded-2xl border-2 bg-background text-base"
                  />
                </div>
              )}

              {error && (
                <p role="alert" className="animate-wiggle rounded-2xl bg-coral-soft px-4 py-3 font-semibold text-coral-shade">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {mode === "masuk" ? "Masuk" : "Daftar Sekarang"}
              </Button>

              {mode === "daftar" && (
                <p className="text-center text-sm text-muted-foreground">
                  Ingat baik-baik kata sandimu, ya! Kata sandi tidak bisa direset lewat email.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
