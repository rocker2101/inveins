/**
 * Enterprise Security Event & Audit Logging Utility
 * Captures authentication attempts, authorization failures, payment security anomalies,
 * and high-risk administrative operations without logging sensitive credentials.
 */

export type SecurityEventSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SecurityEvent {
  event: string;
  severity: SecurityEventSeverity;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export function logSecurityEvent(event: SecurityEvent): void {
  const timestamp = event.timestamp || new Date().toISOString();
  const logEntry = {
    timestamp,
    level: event.severity,
    security_event: event.event,
    ip: event.ip || 'UNKNOWN_IP',
    endpoint: event.endpoint,
    metadata: event.metadata || {},
  };

  // Structured JSON output for CloudWatch, Vercel Logs, Datadog
  const serialized = JSON.stringify(logEntry);

  if (event.severity === 'CRITICAL') {
    console.error(`[SECURITY ALERT - CRITICAL] ${serialized}`);
  } else if (event.severity === 'WARNING') {
    console.warn(`[SECURITY WARNING] ${serialized}`);
  } else {
    console.info(`[SECURITY AUDIT] ${serialized}`);
  }
}
