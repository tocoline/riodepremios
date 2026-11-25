import type { APIRoute } from 'astro';
import { adsense } from '../lib/site';
export const GET: APIRoute = () => {
  const pub = adsense.client.replace(/^ca-/, '');
  return new Response(pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# configure PUBLIC_ADSENSE_CLIENT\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
