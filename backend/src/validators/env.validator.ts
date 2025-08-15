import {z} from 'zod'

export const envSchema = z.object({
  PORT: z.string().optional(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  // Você pode adicionar mais variáveis aqui conforme necessário
});