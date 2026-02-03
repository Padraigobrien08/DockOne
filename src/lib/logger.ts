/**
 * Basic structured logging for server actions. No PII.
 * Logs event name and optional safe metadata (e.g. action, app_id, count).
 */

type LogMeta = Record<string, string | number | boolean | null | undefined>;

export function log(event: string, meta?: LogMeta): void {
  const payload = { event, ...meta, ts: new Date().toISOString() };
  console.log(JSON.stringify(payload));
}
