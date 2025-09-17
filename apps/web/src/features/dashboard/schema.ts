import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string(),
  farmId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;
