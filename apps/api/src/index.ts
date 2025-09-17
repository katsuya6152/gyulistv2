import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import { checkDatabaseConnection, getDatabaseInfo } from "./db/connection.js";
import authRoutes from "./presentation/routes/auth";
import { createAuthRoutes } from "./presentation/routes/auth";

const app = new Hono();

// CORS設定
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

export const createRoutes = (app: Hono) => {
  return app
    .basePath("/api/v2/")
    .route("/auth", createAuthRoutes())
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
