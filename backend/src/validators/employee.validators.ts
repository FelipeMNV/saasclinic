import { z } from "zod";
import { Role } from "../../generated/prisma"; 

export const employeeSchema = z.object({
  name: z.string().max(32).trim(),
  speciality: z.string().max(32).trim(),
  clinica_id: z.uuid(),
  email: z.email().max(128).trim(),
  password: z.string().min(6).max(128).trim(),
  role: z.enum(Role),
});

export const employeeSchemaLogin = z.object({
    email: z.email().max(128).trim(),
    password: z.string().max(64).min(8).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/).trim(),
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
