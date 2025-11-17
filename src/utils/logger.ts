/**
 * Logger utility for error logging and debugging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  url?: string;
  userAgent?: string;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      stack: data?.stack || (data instanceof Error ? data.stack : undefined),
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = this.formatLog(level, message, data);

    // Always log to console
    const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                         level === LogLevel.WARN ? 'warn' : 
                         level === LogLevel.DEBUG ? 'debug' : 'log';
    
    console[consoleMethod](`[${level}] ${message}`, data || '');

    // In development, show detailed log entry
    if (this.isDevelopment) {
      console[consoleMethod]('Log Entry:', logEntry);
    }

    // In production, you can send to error tracking service
    // Example: sendToErrorTrackingService(logEntry);
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error: Error | string, data?: any) {
    const errorData = error instanceof Error 
      ? { ...data, message: error.message, stack: error.stack, name: error.name }
      : { ...data, message: error };
    
    this.log(LogLevel.ERROR, typeof error === 'string' ? error : error.message, errorData);
  }

  // Specialized error logging methods
  logApiError(endpoint: string, status: number, error: any, requestData?: any) {
    this.error(
      `API Error: ${endpoint}`,
      error instanceof Error ? error : new Error(String(error)),
      {
        endpoint,
        status,
        requestData,
        response: error,
      }
    );
  }

  logComponentError(componentName: string, error: Error, errorInfo?: any) {
    this.error(
      `Component Error: ${componentName}`,
      error,
      {
        componentName,
        errorInfo,
      }
    );
  }

  logNetworkError(endpoint: string, error: Error | string) {
    this.error(
      `Network Error: ${endpoint}`,
      error instanceof Error ? error : new Error(String(error)),
      {
        endpoint,
        type: 'network',
      }
    );
  }
}

export const logger = new Logger();
export default logger;

