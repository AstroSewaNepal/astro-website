type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const parseLogLevel = (value: string | undefined): LogLevel => {
  const normalized = value?.toLowerCase() as LogLevel | undefined;
  if (
    normalized &&
    Object.prototype.hasOwnProperty.call(levelWeights, normalized)
  ) {
    return normalized;
  }
  return 'info';
};

const activeLevel = parseLogLevel(process.env.LOG_LEVEL);

const toLogMethod = (level: LogLevel): ((...args: unknown[]) => void) => {
  switch (level) {
    case 'debug':
      return console.debug.bind(console);
    case 'info':
      return console.info.bind(console);
    case 'warn':
      return console.warn.bind(console);
    case 'error':
      return console.error.bind(console);
    default:
      return console.log.bind(console);
  }
};

const safeSerialize = (meta: unknown): string => {
  try {
    return JSON.stringify(meta);
  } catch (error) {
    return `"${String(error)}"`;
  }
};

const shouldLog = (level: LogLevel): boolean =>
  levelWeights[level] >= levelWeights[activeLevel];

const log = (level: LogLevel, message: string, meta?: unknown): void => {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const serializedMeta = meta !== undefined ? ` ${safeSerialize(meta)}` : '';
  const formatter = toLogMethod(level);

  formatter(`[${timestamp}] [${level.toUpperCase()}] ${message}${serializedMeta}`);
};

export const logger = {
  debug: (message: string, meta?: unknown) => log('debug', message, meta),
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
} as const;

export type Logger = typeof logger;
