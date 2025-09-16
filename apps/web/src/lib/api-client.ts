import { hc } from 'hono/client';
import type { AppType } from "@gyulistv2/api";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const client = hc<AppType>(baseUrl);