import express, { type Application } from "express";
import routes from "./routes";

export class App {
  public app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use("/api", routes);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running at ${this.port}`);
    });
  }
}
