import {z} from 'zod'

export const userSchema = z.object({
    name: z.string().max(32).trim(),
    email: z.email().max(128).trim(),
    password: z.string().max(64).min(8).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/).trim(),
});

export const userParamsSchema = z.object({
    id: z.uuid(),
})

export const loginSchema = z.object({
    email: z.email().max(128).trim(),
    password: z.string().max(64).min(8).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/).trim(),
})

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  password: z.string().max(64).min(8).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Deve fornecer pelo menos um campo para atualizar",
});

