// src/server.ts
import { App } from "./app";

const PORT = Number(process.env.PORT) || 3000;

const server = new App(PORT);
server.listen();
