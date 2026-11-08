type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

class Logger {
  private isProduction = process.env.NODE_ENV === "production";

  private formatMessage(entry: LogEntry): string {
    if (this.isProduction) {
      return JSON.stringify(entry);
    }

    const color = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m",  // Green
      warn: "\x1b[33m",  // Yellow
      error: "\x1b[31m", // Red
    }[entry.level];
    const reset = "\x1b[0m";

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`;
    if (entry.meta && Object.keys(entry.meta).length > 0) {
      output += `\n  Meta: ${JSON.stringify(entry.meta, null, 2)}`;
    }
    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}\n  Stack: ${entry.error.stack}`;
    }
    return output;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>, err?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
    };

    if (err instanceof Error) {
      entry.error = {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    } else if (err) {
      entry.meta = { ...entry.meta, rawError: err };
    }

    const formatted = this.formatMessage(entry);
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "debug":
        if (!this.isProduction) {
          console.debug(formatted);
        }
        break;
    }
  }

  public info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  }

  public error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    this.log("error", message, meta, error);
  }

  public debug(message: string, meta?: Record<string, unknown>) {
    this.log("debug", message, meta);
  }
}

export const logger = new Logger();

