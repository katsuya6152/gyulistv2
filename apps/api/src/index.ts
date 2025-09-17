import { Hono } from "hono";
import { hc } from "hono/client";
import { checkDatabaseConnection, getDatabaseInfo } from "./db/connection.js";

const app = new Hono();

export const createRoutes = (app: Hono) => {
  return app
    .basePath("/api/v2/")
    .get("/health", async (c) => {
      const dbInfo = await getDatabaseInfo();
      return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: dbInfo,
      });
    })
    .get("/health/db", async (c) => {
      const dbConnection = await checkDatabaseConnection();
      return c.json(dbConnection);
    })
    .get("/", (c) => {
      return c.json({ message: "Gyulist v2 API" });
    });
};
const routes = createRoutes(app);

export type AppType = typeof routes;

type ClientType = typeof hc<AppType>;

export const createClient = (...args: Parameters<ClientType>): ReturnType<ClientType> => {
  return hc<AppType>(...args);
};

const port = process.env.PORT || 3001;

// サーバーを起動
import { serve } from "@hono/node-server";

console.log(`🚀 Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
