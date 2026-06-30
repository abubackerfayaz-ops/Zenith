const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (ch) => ENTITY_MAP[ch] || ch);
}

export function sanitizeInput(value: string): string {
  return value
    .replace(/[\u0000-\u001F]/g, '')
    .replace(/<script[\s>]/gi, '')
    .replace(/<[\s\/]*(iframe|object|embed|form|input|textarea|select|button|meta|link|style)/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .trim();
}

export function sanitizeDisplayName(name: string): string {
  return sanitizeInput(name).slice(0, 100);
}

export function sanitizeBio(bio: string): string {
  return sanitizeInput(bio).slice(0, 500);
}

export function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
}
