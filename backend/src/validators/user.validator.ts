import {z} from 'zod'

export const userSchema = z.object({
    username: z.string().max(16).trim(),
    email: z.string().email().max(128),
    password: z.string().max(64).min(8).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/),
});

export const userParamsSchema = z.object({
    id: z.string().regex(/^\d+$/, "ID deve ser numérico"),
})