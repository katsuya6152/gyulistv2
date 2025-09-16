import { hc } from 'hono/client';
import type { AppType } from "@gyulistv2/api";

const baseUrl = process.env.API_URL || "http://api:3001";
export const client = hc<AppType>(baseUrl);