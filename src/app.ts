import compression from 'compression';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { LoggerService } from './helpers/LoggerService';
import routes from './routes';

export class App {
  public readonly app: Application;
  private readonly port: number;
  private readonly logger: LoggerService;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.logger = new LoggerService();

    this.middlewares();
    this.routes();
    this.errorHandler();
    this.notFound();
    this.errorHandler();
  }

  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());

    this.app.use((req, _res, next) => {
      this.logger.info(`Incoming request: ${req.method} ${req.url}`);
      next();
    });
  }

  private routes(): void {
    this.app.use('/', routes);

    this.app.get('/health-check', (_, res) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  private notFound() {
    this.app.use((_req, res) => {
      res.status(404).json({ message: 'Not Found' });
    });
  }

  private errorHandler(): void {
    this.app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        this.logger.error(err instanceof Error ? err : String(err));
        res
          .status(err.status || 500)
          .json({ message: err.message || 'Internal Server Error' });
      }
    );
  }

  public listen(): void {
    const server = this.app.listen(this.port, () => {
      console.log(`✅ Server running at http://localhost:${this.port}`);
    });

    const shutdown = () => {
      console.log('🔻 Shutting down...');
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
