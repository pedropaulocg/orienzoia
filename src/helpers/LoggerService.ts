import pino, { type Logger, type LoggerOptions } from 'pino';

export class LoggerService {
  private readonly logger: Logger;

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';

    const options: LoggerOptions = {
      level: isProd ? 'info' : 'debug',
      ...(isProd
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          }),
    };

    this.logger = pino(options);
  }

  public debug(message: string, meta?: unknown) {
    this.logger.debug(meta ?? {}, message);
  }
  public info(message: string, meta?: unknown) {
    this.logger.info(meta ?? {}, message);
  }
  public warn(message: string, meta?: unknown) {
    this.logger.warn(meta ?? {}, message);
  }
  public error(message: string | Error, meta?: unknown) {
    if (message instanceof Error)
      this.logger.error({ err: message, ...(meta ?? {}) }, message.message);
    else this.logger.error(meta ?? {}, message);
  }
}
