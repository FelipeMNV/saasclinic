import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().max(32).trim(),
  speciality: z.string().max(32).trim(),
  clinica_id: z.uuid(),
  email: z.email().max(128).trim(),
  password: z.string().min(6).max(128).trim(),
});

export const employeeUpdateSchema = z.object({
  name: z.string().max(32).trim().optional(),
  speciality: z.string().max(32).trim().optional(),
});

export const employeeParamsSchema = z.object({
  clinica_id: z.uuid(),
});

export const employeeIdSchema = z.object({
  employee_id: z.uuid(),
});
