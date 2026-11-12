import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { MatrixView } from "@/components/MatrixView";
import mascot from "@/assets/mascot-wave.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mahtrix — Belajar Matriks Jadi Seru!" },
      {
        name: "description",
        content:
          "Belajar matriks SMA kelas 10–11 dengan materi bergambar, latihan soal tanpa batas, evaluasi, poin, dan lencana.",
      },
      { property: "og:title", content: "Mahtrix — Belajar Matriks Jadi Seru!" },
      {
        property: "og:description",
        content: "Materi, latihan soal, dan evaluasi matriks yang ramah anak. Simpan progresmu dan kumpulkan lencana!",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { emoji: "📖", title: "Pembelajaran", text: "9 materi matriks yang ringkas, bergambar, dan penuh contoh.", tone: "bg-coral-soft" },
  { emoji: "🧩", title: "Latihan Soal", text: "Soal baru setiap main, langsung ada pembahasannya.", tone: "bg-sunny-soft" },
  { emoji: "📝", title: "Evaluasi", text: "15 soal campuran dengan waktu, lihat nilaimu!", tone: "bg-teal-soft" },
  { emoji: "🏆", title: "Poin & Lencana", text: "Progres tersimpan otomatis di akunmu.", tone: "bg-sky-soft" },
];

function useHasSession() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);
  return signedIn;
}

function Landing() {
  const signedIn = useHasSession();
  return (
    <div className="min-h-screen overflow-hidden bg-dots">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Logo />
        {signedIn ? (
          <Button asChild size="sm" variant="teal">
            <Link to="/beranda">Ke Beranda</Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link to="/auth">Masuk</Link>
          </Button>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section className="grid items-center gap-6 pt-4 md:grid-cols-2 md:pt-12">
          <div className="order-2 text-center md:order-1 md:text-left">
            <span className="inline-block rounded-full bg-sunny px-4 py-1 font-display text-sm font-semibold shadow-[0_3px_0_0_var(--sunny-shade)]">
              Untuk SMA kelas 10–11 ✨
            </span>
            <h1 className="mt-4 text-5xl leading-[1.05] font-bold sm:text-6xl">
              Belajar <span className="text-coral">matriks</span> jadi{" "}
              <span className="relative inline-block">
                seru!
                <span className="absolute inset-x-0 -bottom-1 -z-10 h-4 rounded-full bg-teal/60" />
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Kenalan dengan Mixi si robot matriks. Pelajari materinya, jawab latihan, lalu taklukkan evaluasi untuk
              mengumpulkan poin dan lencana.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button asChild size="xl">
                {signedIn ? (
                  <Link to="/beranda">
                    Lanjut Belajar <ArrowRight />
                  </Link>
                ) : (
                  <Link to="/auth">
                    Mulai Belajar <ArrowRight />
                  </Link>
                )}
              </Button>
              {!signedIn && (
                <Button asChild size="xl" variant="outline">
                  <Link to="/auth" search={{ mode: "daftar" }}>
                    Buat Akun
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-sm md:order-2">
            <div className="absolute inset-6 rounded-full bg-sunrise blur-sm" />
            <img
              src={mascot}
              alt="Mixi, robot maskot Mahtrix, memegang kurung siku matriks"
              width={1024}
              height={1024}
              className="relative animate-float"
            />
            <div className="absolute -left-2 bottom-6 rotate-[-6deg] rounded-2xl bg-card px-3 py-2 shadow-float sm:-left-8">
              <MatrixView m={[[1, 2], [3, 4]]} size="sm" />
            </div>
            <div className="absolute top-8 -right-1 rotate-[8deg] rounded-2xl bg-coral px-3 py-2 font-display font-bold text-primary-foreground shadow-float sm:-right-6">
              det = −2
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Fitur Mahtrix">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="pop-card animate-pop-in p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className={`inline-flex size-14 items-center justify-center rounded-2xl text-3xl ${f.tone}`}>
                {f.emoji}
              </span>
              <h2 className="mt-3 text-xl font-bold">{f.title}</h2>
              <p className="mt-1 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-4xl bg-coral p-6 text-center text-primary-foreground shadow-[0_6px_0_0_var(--coral-shade)] sm:p-10">
          <h2 className="text-3xl font-bold sm:text-4xl">Siap jadi Master Mahtrix? 👑</h2>
          <p className="mt-2 text-lg opacity-90">Daftar cukup pakai username dan kata sandi.</p>
          <Button asChild size="lg" variant="sunny" className="mt-6">
            {signedIn ? <Link to="/beranda">Ayo lanjut!</Link> : <Link to="/auth" search={{ mode: "daftar" }}>Ayo mulai!</Link>}
          </Button>
        </section>
      </main>
    </div>
  );
}
