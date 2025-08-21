
import {z} from 'zod'

import { Decimal } from "@prisma/client/runtime/library";

export const updateServiceSchema = z.object({
    name: z.string().min(5).max(64).trim().optional(),
    description: z.string().min(10).max(256).trim().optional(),
    price: z.string()
    .optional()
    .refine(
      (val) => val === undefined || !isNaN(Number(val)),
      { message: "Price must be a number" }
    )
    .transform((val: string | undefined) => (val !== undefined ? new Decimal(val) : undefined)),
})

export const createServiceSchema = z.object({
    name: z.string().min(5).max(64).trim(),
    description: z.string().min(10).max(256).trim(),
    price: z.string()
    .refine(
    (val) => !isNaN(Number(val)), 
    { message: "Price must be a number" }
    )
    .transform((val: string) => new Decimal(val)),
})