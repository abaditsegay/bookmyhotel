/**
 * Professional logging utility for development and production environments
 * This ensures no sensitive data is logged in production while maintaining
 * development debugging capabilities
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;

  private shouldLog(level: LogLevel): boolean {
    return this.isDevelopment && level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any): void {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data !== undefined) {
      // console.log(`${prefix} ${message}`, data);
    } else {
      // console.log(`${prefix} ${message}`);
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.formatMessage('ERROR', message, error);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.formatMessage('WARN', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.formatMessage('INFO', message, data);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('DEBUG', message, data);
    }
  }

  // Specific method for component state debugging
  componentState(componentName: string, state: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('COMPONENT', `${componentName} state:`, state);
    }
  }

  // Specific method for API call logging
  apiCall(method: string, endpoint: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('API', `${method} ${endpoint}`, data);
    }
  }

  // Specific method for API response logging
  apiResponse(endpoint: string, response: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('API_RESPONSE', endpoint, response);
    }
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;