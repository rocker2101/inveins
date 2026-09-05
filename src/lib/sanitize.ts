/**
 * Enterprise Input Sanitization & Security Validation Utility
 * Protects against Stored XSS, HTML Injection, and Malformed Payloads.
 */

// Strip HTML tags, script vectors, and javascript: links
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Strip all HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .trim();
}

// Strictly validate and sanitize email
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 120;
}

// Normalize phone numbers (strips +91, leading 0, spaces, dashes)
export function normalizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

// Strictly validate and sanitize 10-digit Indian phone numbers
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = normalizePhone(phone);
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
}

// Strictly validate 6-digit Indian PIN Code
export function isValidPincode(pincode: string): boolean {
  if (!pincode || typeof pincode !== 'string') return false;
  const cleaned = pincode.replace(/[^0-9]/g, '');
  return cleaned.length === 6;
}

// Sanitize a record of key-value pairs (e.g. form fields)
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
