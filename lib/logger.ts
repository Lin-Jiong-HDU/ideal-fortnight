/**
 * 统一日志工具
 * - 开发环境：输出所有级别
 * - 生产环境：仅输出 warn 和 error
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV === 'development';

function formatMessage(level: LogLevel, message: string): string {
  return `[${level.toUpperCase()}] ${message}`;
}

const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(formatMessage('debug', message), ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.info(formatMessage('info', message), ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(formatMessage('warn', message), ...args);
  },

  error: (message: string, ...args: unknown[]) => {
    console.error(formatMessage('error', message), ...args);
  },
};

export default logger;
