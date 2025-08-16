import {z} from 'zod'

export const clinicRegisterSchema = z.object({
    name: z.string().max(64).trim(),
    slug: z.string().max(64).trim(),
    contact: z.string().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/).trim(),
    address: z.string().trim()
})

export const clinicSlug = z.string().min(1);

export const clinicUserId = z.object({
    user_id: z.uuid(),
})
export const clinicId = z.object({
    clinica_id: z.uuid(),
})

