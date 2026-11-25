const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('pt-BR');

export const reais = (v?: number | null) => (v == null ? '—' : brl.format(v));
export const reaisCurto = (v?: number | null) => {
  if (v == null) return '—';
  if (v >= 1e9) return `R$ ${(v / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} bilhão${v >= 2e9 ? 'ões'.slice(0) : ''}`.replace('bilhãoões', 'bilhões');
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} milhões`;
  return brl0.format(v);
};
export const numero = (v: number) => num.format(v);
export const pad = (n: number | string, l = 2) => String(n).padStart(l, '0');

export function dataBR(iso?: string | null, longo = false) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString('pt-BR', longo
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
    : { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}
