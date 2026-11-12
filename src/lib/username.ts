/**
 * Mahtrix signs students in with a username only. Accounts still need an email
 * internally, so each username maps to a fixed, non-deliverable address.
 */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export const normalizeUsername = (raw: string) => raw.trim().toLowerCase();

export const isValidUsername = (raw: string) => USERNAME_PATTERN.test(normalizeUsername(raw));

export const usernameToEmail = (raw: string) => `${normalizeUsername(raw)}@siswa.mahtrix.app`;

export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists"))
    return "Username ini sudah dipakai teman lain. Coba username lain, ya!";
  if (m.includes("invalid login credentials")) return "Username atau kata sandi salah. Coba lagi!";
  if (m.includes("pwned") || m.includes("weak") || m.includes("known to be"))
    return "Kata sandi ini terlalu mudah ditebak. Pakai kombinasi yang lebih unik, ya!";
  if (m.includes("password") && m.includes("6"))
    return "Kata sandi minimal 6 karakter.";
  if (m.includes("rate limit")) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  return "Ups, ada yang salah. Coba lagi sebentar lagi ya.";
}
