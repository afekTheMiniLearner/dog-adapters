import { LOGGING_MODE, NODE_ENV } from './environment-variables';
import winston from 'winston';

const enum LEVELS {
    error = 'error',
    warn = 'warn',
    info = 'info',
    debug = 'debug',
    verbose = 'verbose',
    useraction = 'useraction',
    silly = 'silly',
}

interface PRINTF {
    request_id: string;
    timestamp: string;
    message: string;
    level: LEVELS;
    [key: string]: any;
}

function stringifyMetaData(metadata: string | object = '') {
    if (!metadata || typeof metadata === 'string') return metadata;

    return Object.keys(metadata).length
        ? `\n\t${Object.keys(metadata)
              .map((key) => {
                  const value = (<any>metadata)[key];
                  const valueStr =
                      value && typeof value === 'object'
                          ? JSON.stringify(value)
                          : value;

                  return `${key}: ${valueStr}`;
              })
              .filter((v) => v)
              .join(',\n\t')}`
        : '';
}

class Logger {
    private logger;

    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({ level: LOGGING_MODE }),
            ],
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.splat(),
                winston.format.timestamp(),
                winston.format.printf(
                    ({
                        timestamp,
                        level,
                        request_id,
                        message,
                        ...metadata
                    }: winston.Logform.TransformableInfo | PRINTF): string => {
                        return `${timestamp} [${level}] [${request_id}] ${message} ${stringifyMetaData(
                            metadata
                        )}`;
                    }
                )
            ),
        });

        this.logger.on('error', (error: any) => {
            console.error('Logger Error Caught: ', error);
        });
    }

    _getLineTrace(error: Error) {
        const lineTraces =
            error?.stack
                ?.split('\n')
                .filter((line) => !/\\logger\.[jt]s:\d+:\d+\),?$/.test(line)) ||
            [];

        let lineTrace = lineTraces[1];
        for (const line of lineTraces.slice(1)) {
            const isLoggerFile = /[lL]ogger\.[tj]s:\d+:\d+\)$/.test(
                line.trim()
            );
            if (!isLoggerFile) {
                lineTrace = line;
                break;
            }
        }

        return lineTrace.trimStart();
    }

    writeLog(
        level: LEVELS,
        request_id: string,
        message: string,
        options: any = {}
    ) {
        if (options?.hasOwnProperty('message')) {
            options.$message = options.message;
            delete options.message;
        }

        let lineTrace;
        if (
            ['local', 'test'].includes(NODE_ENV as string) ||
            level === LEVELS.error
        ) {
            const error = new Error(message);
            lineTrace = this._getLineTrace(error);
        }

        this.logger.log(level, message, {
            request_id,
            ...options,
            ...{ lineTrace },
        });
    }

    error(request_id: string, message: any, metadata: any = {}) {
        this.writeLog(LEVELS.error, request_id, message, metadata);
    }

    warn(request_id: string, message: any, metadata = {}) {
        this.writeLog(LEVELS.warn, request_id, message, metadata);
    }

    info(request_id: string, message: any, metadata = {}) {
        this.writeLog(LEVELS.info, request_id, message, metadata);
    }

    debug(request_id: string, message: any, metadata = {}) {
        this.writeLog(LEVELS.debug, request_id, message, metadata);
    }

    verbose(request_id: string, message: any, metadata = {}) {
        this.writeLog(LEVELS.verbose, request_id, message, metadata);
    }

    userAction(request_id: string, message: any, metadata = {}) {
        this.writeLog(LEVELS.useraction, request_id, message, metadata);
    }

    silly(request_id: string, message: any, metadata = {}) {
        this.writeLog(LEVELS.silly, request_id, message, metadata);
    }
}

const logger = new Logger();
export default logger;

// Print the first log, with the current logging mode
(<any>logger)[LOGGING_MODE]('LOGGER', 'logger instance created', {
    LOGGING_MODE,
});
