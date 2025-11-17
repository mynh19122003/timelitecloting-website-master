/**
 * Logger utility for backend error logging
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
  formatLog(level, message, data = {}) {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      ...data,
    };
  }

  log(level, message, data = {}) {
    const logEntry = this.formatLog(level, message, data);
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;

    switch (level) {
      case 'ERROR':
        console.error(prefix, message, data);
        if (isDevelopment && data.stack) {
          console.error('Stack trace:', data.stack);
        }
        break;
      case 'WARN':
        console.warn(prefix, message, data);
        break;
      case 'INFO':
        console.log(prefix, message, data);
        break;
      case 'DEBUG':
        if (isDevelopment) {
          console.debug(prefix, message, data);
        }
        break;
      default:
        console.log(prefix, message, data);
    }

    // In production, you can send to error tracking service
    // Example: sendToErrorTrackingService(logEntry);
  }

  debug(message, data = {}) {
    this.log('DEBUG', message, data);
  }

  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  error(message, error, data = {}) {
    const errorData = {
      ...data,
      message: error?.message || message,
      stack: error?.stack,
      name: error?.name,
    };
    this.log('ERROR', message, errorData);
  }

  // Specialized error logging methods
  logApiError(req, status, error, additionalData = {}) {
    const errorData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      ...additionalData,
    };

    if (error instanceof Error) {
      errorData.errorMessage = error.message;
      errorData.errorStack = error.stack;
      errorData.errorName = error.name;
    } else {
      errorData.error = error;
    }

    this.error(`API Error: ${req.method} ${req.originalUrl || req.url}`, error instanceof Error ? error : new Error(String(error)), errorData);
  }

  logDatabaseError(operation, error, query = null) {
    this.error(`Database Error: ${operation}`, error, {
      operation,
      query: query ? (typeof query === 'string' ? query : JSON.stringify(query)) : null,
    });
  }

  logAuthError(req, reason, additionalData = {}) {
    this.warn(`Auth Error: ${reason}`, {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection?.remoteAddress,
      ...additionalData,
    });
  }
}

const logger = new Logger();
module.exports = logger;

