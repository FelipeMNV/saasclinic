import {z} from 'zod'

export const clinicRegisterSchema = z.object({
    name: z.string().max(64).trim(),
    slug: z.string().max(64).trim(),
    contact: z.string().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/).trim(),
    address: z.string().trim()
})

export const clinicIdAndName = z.object({
    id: z.uuid(),
    name: z.string().max(64).trim()
})

export const clinicIdAndSlug = z.object({
    id: z.uuid(),
    slug: z.string().max(64).trim()
})

export const clinicIdAndContact = z.object({
    id: z.uuid(),
    contact: z.string().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/).trim()
})

export const clinicIdAndAddress = z.object({
    
})

