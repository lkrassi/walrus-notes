export const WS_CONNECTION_PATH = '/wn/api/connection';

export function buildWsUrl(baseHost?: string, userId?: string) {
  const rawBase =
    typeof baseHost === 'string' && baseHost.length
      ? baseHost
      : (import.meta.env.VITE_BASE_URL as string | undefined);

  const envBase = rawBase ? rawBase.split(/[?#]/)[0] : rawBase;

  let base = '';

  if (envBase && envBase.length) {
    if (/^https?:\/\//.test(envBase)) {
      base = envBase.replace(/^https?:\/\//, 'wss://');
    } else if (/^wss?:\/\//.test(envBase)) {
      base = envBase.replace(/^wss?:\/\//, 'wss://');
    } else {
      base = `wss://${envBase}`;
    }
  } else if (typeof window !== 'undefined' && window.location) {
    base = `wss://${window.location.host}`;
  }

  let url = base ? `${base}${WS_CONNECTION_PATH}` : WS_CONNECTION_PATH;

  if (userId && !/user_id=/i.test(url)) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}user_id=${encodeURIComponent(userId)}`;
  }

  return url;
}
