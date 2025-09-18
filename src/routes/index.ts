import { Router } from "express";

const routes = Router();

routes.get("/", (req, res) => {
  res.send("API OrienzoIA rodando");
});

export default routes;
