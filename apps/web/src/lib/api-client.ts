import type { AppType } from "@gyulistv2/api";
import { hc } from "hono/client";

const baseUrl = process.env.API_URL || "http://api:3001";
export const client = hc<AppType>(baseUrl);
