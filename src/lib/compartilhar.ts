// Utilitários de compartilhamento (cliente)
export function linkWhatsApp(texto: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${texto}\n${url}`)}`;
}
export async function compartilhar(titulo: string, texto: string, url: string) {
  if (navigator.share) { try { await navigator.share({ title: titulo, text: texto, url }); return true; } catch { return false; } }
  try { await navigator.clipboard.writeText(`${texto}\n${url}`); return true; } catch { return false; }
}
export function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** base64url de JSON com acentos */
export function codificar(obj: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = ''; bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodificar<T>(s: string): T | null {
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  } catch { return null; }
}
