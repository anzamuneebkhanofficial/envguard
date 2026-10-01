type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

const SENSITIVE_LOG_KEYS = new Set([
  'password',
  'passwordhash',
  'jwt_secret',
  'smtp_pass',
  'secret',
  'token',
  'authorization',
  'value',
  'oldvalue',
  'newvalue'
]);

function sanitizeMeta(meta?: LogContext): LogContext | undefined {
  if (!meta) return undefined;
  const sanitized: LogContext = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE_LOG_KEYS.has(k.toLowerCase())) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeMeta(v as LogContext);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

function log(level: LogLevel, message: string, meta?: LogContext): void {
  const timestamp = new Date().toISOString();
  const sanitized = sanitizeMeta(meta);
  const entry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(sanitized ? { meta: sanitized } : {}),
  };

  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info: (message: string, meta?: LogContext) => log('info', message, meta),
  warn: (message: string, meta?: LogContext) => log('warn', message, meta),
  error: (message: string, meta?: LogContext) => log('error', message, meta),
  debug: (message: string, meta?: LogContext) => log('debug', message, meta),
};
