import type { Cell } from "./matrix";
import type { Tone } from "./avatars";

export type LessonBlock =
  | { kind: "p"; text: string }
  | { kind: "matrix"; items: { label?: string; m: Cell[][] }[]; caption?: string }
  | { kind: "tip"; text: string }
  | { kind: "formula"; text: string; caption?: string }
  | { kind: "list"; items: string[] }
  | { kind: "gallery"; items: { name: string; desc: string; m: Cell[][] }[] }
  | {
      kind: "example";
      title: string;
      items?: { label?: string; m: Cell[][] }[];
      steps: string[];
      result?: { label?: string; m: Cell[][] };
    };

export type Lesson = {
  id: string;
  title: string;
  short: string;
  emoji: string;
  tone: Tone;
  summary: string;
  blocks: LessonBlock[];
};

export const LESSONS: Lesson[] = [
  {
    id: "pengenalan",
    title: "Apa Itu Matriks?",
    short: "Pengenalan",
    emoji: "🧩",
    tone: "coral",
    summary: "Kenalan dengan baris, kolom, ordo, dan elemen matriks.",
    blocks: [
      {
        kind: "p",
        text: "Matriks adalah susunan bilangan berbentuk persegi panjang yang diatur dalam baris dan kolom, lalu ditulis di dalam kurung siku [ ]. Matriks diberi nama dengan huruf kapital, misalnya A, B, atau C.",
      },
      {
        kind: "matrix",
        items: [{ label: "A", m: [[2, 5, 1], [7, 0, 3]] }],
        caption: "Matriks A punya 2 baris dan 3 kolom.",
      },
      {
        kind: "list",
        items: [
          "Baris = susunan bilangan yang mendatar (kiri ke kanan).",
          "Kolom = susunan bilangan yang tegak (atas ke bawah).",
          "Ordo = banyak baris × banyak kolom. Matriks A di atas berordo 2 × 3, ditulis A₂ₓ₃.",
        ],
      },
      {
        kind: "p",
        text: "Setiap bilangan di dalam matriks disebut elemen. Elemen ditulis aᵢⱼ, artinya elemen pada baris ke-i dan kolom ke-j. Pada matriks A: a₁₂ = 5, a₂₁ = 7, dan a₂₃ = 3.",
      },
      { kind: "tip", text: "Ingat jurus BaKo: Baris dulu, baru Kolom! Berlaku untuk ordo maupun posisi elemen." },
      {
        kind: "example",
        title: "Tentukan ordo dan elemen b₂₁ dari matriks B.",
        items: [{ label: "B", m: [[4, -1], [6, 8], [0, 2]] }],
        steps: [
          "Hitung barisnya: ada 3 baris. Hitung kolomnya: ada 2 kolom.",
          "Jadi ordo B adalah 3 × 2.",
          "b₂₁ = elemen baris ke-2, kolom ke-1 = 6.",
        ],
      },
    ],
  },
  {
    id: "jenis",
    title: "Jenis-Jenis Matriks",
    short: "Jenis Matriks",
    emoji: "🎨",
    tone: "sunny",
    summary: "Matriks baris, kolom, persegi, nol, identitas, diagonal, dan segitiga.",
    blocks: [
      {
        kind: "p",
        text: "Matriks punya banyak 'kostum' sesuai bentuk dan isinya. Yuk kenali satu per satu!",
      },
      {
        kind: "gallery",
        items: [
          { name: "Matriks Baris", desc: "Hanya punya 1 baris.", m: [[3, 1, 4]] },
          { name: "Matriks Kolom", desc: "Hanya punya 1 kolom.", m: [[2], [5], [9]] },
          { name: "Matriks Persegi", desc: "Banyak baris = banyak kolom.", m: [[1, 2], [3, 4]] },
          { name: "Matriks Nol", desc: "Semua elemennya 0, ditulis O.", m: [[0, 0], [0, 0]] },
          {
            name: "Matriks Diagonal",
            desc: "Persegi, elemen di luar diagonal utama semuanya 0.",
            m: [[3, 0, 0], [0, 5, 0], [0, 0, 2]],
          },
          {
            name: "Matriks Identitas",
            desc: "Diagonal utama 1, lainnya 0. Ditulis I.",
            m: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
          },
          {
            name: "Segitiga Atas",
            desc: "Elemen di bawah diagonal utama semuanya 0.",
            m: [[1, 2, 3], [0, 4, 5], [0, 0, 6]],
          },
          {
            name: "Segitiga Bawah",
            desc: "Elemen di atas diagonal utama semuanya 0.",
            m: [[1, 0, 0], [2, 3, 0], [4, 5, 6]],
          },
          {
            name: "Matriks Simetris",
            desc: "Sama dengan transposenya (A = Aᵀ).",
            m: [[1, 7], [7, 3]],
          },
        ],
      },
      {
        kind: "tip",
        text: "Diagonal utama adalah elemen dari pojok kiri atas ke pojok kanan bawah: a₁₁, a₂₂, a₃₃, dan seterusnya.",
      },
    ],
  },
  {
    id: "transpose",
    title: "Transpose & Kesamaan Matriks",
    short: "Transpose",
    emoji: "🔄",
    tone: "teal",
    summary: "Membalik baris jadi kolom, dan syarat dua matriks dikatakan sama.",
    blocks: [
      {
        kind: "p",
        text: "Transpose matriks A (ditulis Aᵀ) didapat dengan mengubah baris menjadi kolom. Baris pertama jadi kolom pertama, baris kedua jadi kolom kedua, dan seterusnya.",
      },
      {
        kind: "matrix",
        items: [
          { label: "A", m: [[1, 2, 3], [4, 5, 6]] },
          { label: "Aᵀ", m: [[1, 4], [2, 5], [3, 6]] },
        ],
        caption: "Ordo A adalah 2 × 3, maka ordo Aᵀ adalah 3 × 2.",
      },
      { kind: "tip", text: "Kalau di-transpose dua kali, matriks kembali seperti semula: (Aᵀ)ᵀ = A." },
      {
        kind: "p",
        text: "Dua matriks A dan B dikatakan sama (A = B) jika ordonya sama dan setiap elemen yang seletak (posisinya sama) nilainya sama.",
      },
      {
        kind: "example",
        title: "Tentukan nilai x dan y agar kedua matriks sama.",
        items: [
          { m: [["x + 1", 4], [3, "2y"]] },
          { m: [[5, 4], [3, 8]] },
        ],
        steps: [
          "Bandingkan elemen seletak: x + 1 = 5, maka x = 4.",
          "2y = 8, maka y = 4.",
          "Jadi x = 4 dan y = 4.",
        ],
      },
    ],
  },
  {
    id: "penjumlahan",
    title: "Penjumlahan & Pengurangan",
    short: "Jumlah & Kurang",
    emoji: "➕",
    tone: "sky",
    summary: "Menjumlah dan mengurangi matriks yang ordonya sama.",
    blocks: [
      {
        kind: "p",
        text: "Dua matriks hanya bisa dijumlahkan atau dikurangkan jika ordonya sama. Caranya mudah: jumlahkan (atau kurangkan) elemen-elemen yang seletak.",
      },
      {
        kind: "example",
        title: "Hitung A + B dan A − B.",
        items: [
          { label: "A", m: [[2, 3], [1, 4]] },
          { label: "B", m: [[5, -1], [0, 2]] },
        ],
        steps: [
          "A + B: 2+5 = 7, 3+(−1) = 2, 1+0 = 1, 4+2 = 6.",
          "A − B: 2−5 = −3, 3−(−1) = 4, 1−0 = 1, 4−2 = 2.",
        ],
        result: { label: "A + B", m: [[7, 2], [1, 6]] },
      },
      {
        kind: "matrix",
        items: [{ label: "A − B", m: [[-3, 4], [1, 2]] }],
      },
      {
        kind: "list",
        items: [
          "Komutatif: A + B = B + A.",
          "Asosiatif: (A + B) + C = A + (B + C).",
          "Matriks nol: A + O = A.",
        ],
      },
      { kind: "tip", text: "Hati-hati! Pengurangan tidak komutatif: A − B belum tentu sama dengan B − A." },
    ],
  },
  {
    id: "skalar",
    title: "Perkalian Skalar",
    short: "Kali Skalar",
    emoji: "✖️",
    tone: "coral",
    summary: "Mengalikan sebuah bilangan dengan setiap elemen matriks.",
    blocks: [
      {
        kind: "p",
        text: "Skalar adalah bilangan biasa (bukan matriks). Perkalian skalar k × A dilakukan dengan mengalikan k ke setiap elemen matriks A.",
      },
      {
        kind: "example",
        title: "Hitung 3A.",
        items: [{ label: "A", m: [[2, -1], [0, 4]] }],
        steps: ["3 × 2 = 6, 3 × (−1) = −3.", "3 × 0 = 0, 3 × 4 = 12."],
        result: { label: "3A", m: [[6, -3], [0, 12]] },
      },
      {
        kind: "list",
        items: ["k(A + B) = kA + kB", "(k + m)A = kA + mA", "k(mA) = (km)A"],
      },
      { kind: "tip", text: "Jangan lupa: semua elemen ikut dikali, termasuk angka 0 dan bilangan negatif." },
    ],
  },
  {
    id: "perkalian",
    title: "Perkalian Dua Matriks",
    short: "Kali Matriks",
    emoji: "🧮",
    tone: "sunny",
    summary: "Jurus baris × kolom untuk mengalikan dua matriks.",
    blocks: [
      {
        kind: "p",
        text: "Matriks A bisa dikalikan dengan matriks B jika banyak kolom A sama dengan banyak baris B.",
      },
      {
        kind: "formula",
        text: "A(m × n) · B(n × p) = C(m × p)",
        caption: "Angka tengah harus sama, hasilnya berordo angka luar.",
      },
      {
        kind: "p",
        text: "Cara menghitung: elemen cᵢⱼ = baris ke-i matriks A dikali kolom ke-j matriks B. Kalikan elemen yang berpasangan lalu jumlahkan.",
      },
      {
        kind: "example",
        title: "Hitung AB.",
        items: [
          { label: "A", m: [[1, 2], [3, 4]] },
          { label: "B", m: [[5, 6], [7, 8]] },
        ],
        steps: [
          "c₁₁ = 1·5 + 2·7 = 19",
          "c₁₂ = 1·6 + 2·8 = 22",
          "c₂₁ = 3·5 + 4·7 = 43",
          "c₂₂ = 3·6 + 4·8 = 50",
        ],
        result: { label: "AB", m: [[19, 22], [43, 50]] },
      },
      {
        kind: "tip",
        text: "Umumnya AB ≠ BA, jadi urutan perkalian itu penting! Tapi untuk matriks identitas berlaku AI = IA = A.",
      },
    ],
  },
  {
    id: "determinan",
    title: "Determinan Matriks",
    short: "Determinan",
    emoji: "🎯",
    tone: "teal",
    summary: "Menghitung determinan matriks 2×2 dan 3×3 (aturan Sarrus).",
    blocks: [
      {
        kind: "p",
        text: "Determinan adalah sebuah bilangan yang dihitung dari matriks persegi. Determinan matriks A ditulis det A atau |A|.",
      },
      {
        kind: "matrix",
        items: [{ label: "A", m: [["a", "b"], ["c", "d"]] }],
      },
      { kind: "formula", text: "det A = ad − bc", caption: "Diagonal utama dikurangi diagonal samping." },
      {
        kind: "example",
        title: "Hitung determinan matriks P.",
        items: [{ label: "P", m: [[4, 3], [2, 5]] }],
        steps: ["det P = 4·5 − 3·2", "= 20 − 6 = 14"],
      },
      {
        kind: "p",
        text: "Untuk matriks 3×3, gunakan aturan Sarrus: salin dua kolom pertama di sebelah kanan matriks. Jumlahkan hasil kali tiga diagonal ke kanan bawah, lalu kurangi dengan jumlah hasil kali tiga diagonal ke kiri bawah.",
      },
      {
        kind: "example",
        title: "Hitung determinan matriks Q dengan aturan Sarrus.",
        items: [{ label: "Q", m: [[2, 1, 3], [0, 4, 1], [5, 2, 0]] }],
        steps: [
          "Diagonal ke kanan: 2·4·0 + 1·1·5 + 3·0·2 = 0 + 5 + 0 = 5",
          "Diagonal ke kiri: 3·4·5 + 2·1·2 + 1·0·0 = 60 + 4 + 0 = 64",
          "det Q = 5 − 64 = −59",
        ],
      },
      { kind: "list", items: ["det(AB) = det A · det B", "det(Aᵀ) = det A"] },
    ],
  },
  {
    id: "invers",
    title: "Invers Matriks 2×2",
    short: "Invers",
    emoji: "🪄",
    tone: "sky",
    summary: "Mencari matriks kebalikan sehingga A · A⁻¹ = I.",
    blocks: [
      {
        kind: "p",
        text: "Invers matriks A ditulis A⁻¹, yaitu matriks yang jika dikalikan dengan A menghasilkan matriks identitas: A · A⁻¹ = A⁻¹ · A = I.",
      },
      {
        kind: "formula",
        text: "A⁻¹ = 1/(ad − bc) · [ d  −b ; −c  a ]",
        caption: "Tukar diagonal utama, ganti tanda diagonal samping, lalu bagi dengan determinan.",
      },
      {
        kind: "tip",
        text: "Jika det A = 0, matriks disebut singular dan TIDAK punya invers. Kalau det A ≠ 0, disebut non-singular.",
      },
      {
        kind: "example",
        title: "Tentukan invers matriks A.",
        items: [{ label: "A", m: [[3, 1], [5, 2]] }],
        steps: [
          "det A = 3·2 − 1·5 = 6 − 5 = 1",
          "Tukar 3 dan 2, ganti tanda 1 dan 5 menjadi −1 dan −5.",
          "Bagi dengan det A = 1, hasilnya tetap.",
        ],
        result: { label: "A⁻¹", m: [[2, -1], [-5, 3]] },
      },
      {
        kind: "p",
        text: "Cek: A · A⁻¹ = [3·2 + 1·(−5), 3·(−1) + 1·3 ; 5·2 + 2·(−5), 5·(−1) + 2·3] = [1 0 ; 0 1] = I. Berhasil!",
      },
    ],
  },
  {
    id: "persamaan",
    title: "Persamaan Matriks",
    short: "Persamaan",
    emoji: "⚖️",
    tone: "coral",
    summary: "Mencari matriks X dari AX = B atau XA = B.",
    blocks: [
      {
        kind: "p",
        text: "Persamaan matriks adalah persamaan yang variabelnya berupa matriks, misalnya X. Kita bisa memakai invers untuk 'memindahkan' matriks.",
      },
      {
        kind: "list",
        items: [
          "Jika A · X = B, maka X = A⁻¹ · B (A⁻¹ di kiri).",
          "Jika X · A = B, maka X = B · A⁻¹ (A⁻¹ di kanan).",
          "Jika X + A = B, maka X = B − A.",
        ],
      },
      { kind: "tip", text: "Posisi A⁻¹ harus sama dengan posisi A, karena perkalian matriks tidak komutatif." },
      {
        kind: "example",
        title: "Selesaikan sistem 2x + y = 5 dan x + y = 3 dengan matriks.",
        items: [
          { label: "A", m: [[2, 1], [1, 1]] },
          { label: "B", m: [[5], [3]] },
        ],
        steps: [
          "Tulis sebagai A · X = B dengan X = [x ; y].",
          "det A = 2·1 − 1·1 = 1, sehingga A⁻¹ = [1 −1 ; −1 2].",
          "X = A⁻¹ · B = [1·5 + (−1)·3 ; (−1)·5 + 2·3] = [2 ; 1].",
          "Jadi x = 2 dan y = 1.",
        ],
        result: { label: "X", m: [[2], [1]] },
      },
    ],
  },
];

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonIndex = (id: string) => LESSONS.findIndex((l) => l.id === id);
