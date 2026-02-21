export function buildYjsWsUrl(baseUrl?: string): string {
  const rawBase =
    typeof baseUrl === 'string' && baseUrl.length
      ? baseUrl
      : (import.meta.env.VITE_BASE_URL as string | undefined);

  const envBase = rawBase ? rawBase.split(/[?#]/)[0] : rawBase;

  let base = '';

  if (envBase && envBase.length) {
    if (/^https:\/\//.test(envBase)) {
      base = envBase.replace(/^https:\/\//, 'wss://');
    } else if (/^http:\/\//.test(envBase)) {
      base = envBase.replace(/^http:\/\//, 'ws://');
    } else if (/^wss?:\/\//.test(envBase)) {
      base = envBase;
    } else {
      const isHttpsHost =
        /\.(onrender\.com|herokuapp\.com|vercel\.app|netlify\.app|pages\.dev)$/i.test(
          envBase
        );

      if (isHttpsHost) {
        base = `wss://${envBase}`;
      } else if (typeof window !== 'undefined' && window.location) {
        const httpProtocol = window.location.protocol;
        const protocol = httpProtocol === 'https:' ? 'wss:' : 'ws:';
        base = `${protocol}//${envBase}`;
      } else {
        base = `ws://${envBase}`;
      }
    }
  } else if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    base = `${protocol}//${window.location.host}`;
  }

  const path = '/wn/api/room';
  const finalUrl = base ? `${base}${path}` : path;

  return finalUrl;
}
