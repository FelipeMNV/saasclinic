import {z} from 'zod'

export const clinicRegisterSchema = z.object({
    name: z.string().max(64).trim(),
    slug: z.string().max(64).trim(),
    contact: z.string().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/).trim(),
    address: z.string().trim()
})


