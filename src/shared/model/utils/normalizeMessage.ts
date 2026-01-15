export const normalizeMessage = (msg: string): string =>
  msg
    .replace(/\s+/g, ' ')
    .replace(/request error[:\s-]*/i, '')
    .trim()
    .toLowerCase();
