import {z} from 'zod'

export const employeeSchema = z.object({
    name: z.string().max(32).trim(),
    speciality: z.string().max(32).trim(),
    clinica_id: z.uuid(),
});

export const employeeParamsSchema = z.object({
    clinica_id: z.uuid(),
})