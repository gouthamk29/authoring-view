import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(16),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1).max(30),
  email: z.email(),
  password: z.string().min(1).max(16),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
