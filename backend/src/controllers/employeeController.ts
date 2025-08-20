import type { Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import {
  employeeSchema,
  employeeIdSchema,
  employeeUpdateSchema,
  employeeSchemaLogin,
} from "../validators/employee.validators.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { Role } from "../../generated/prisma/index";
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function employeeLogin(req: Request, res: Response){
  const result = employeeSchemaLogin.safeParse(req.body);
  
  if (!result.success){
    return res.status(400).json({message: result.error.issues})
  }

  const { email, password } = result.data;
  const employee = await p.employee.findUnique({
    where: {email},
  })
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return res.status(401).json({message: 'Invalid credentials'});
  }

  const token = jwt.sign(
    {id: employee.id, name: employee.name, speciality: employee.speciality, role: employee.role},
    JWT_SECRET,
    {expiresIn: "7d"}
  )

  const {password: _, ...employeeWithoutPassword} = employee;

  return res.status(200).json({
    message: "Employee login successful",
    token,
    employee: employeeWithoutPassword,
  })
}

export async function createEmployee(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated user" });
  }

  if (!req.params.slug) {
    return res.status(400).json({ message: "Slug is mandatory" });
  }

  if (!req.user.clinica_id) {
    return res
      .status(403)
      .json({ message: "User is not linked to any clinic" });
  }

  if(!req.clinic?.id){
    return res.status(404).json({message: 'Clinic not found'})
  }

  const result = employeeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues });
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 10);
  const newEmployee = await p.employee.create({
    data: {
      name: result.data.name,
      speciality: result.data.speciality,
      clinica_id: req.clinic.id,
      email: result.data.email,
      password: hashedPassword,
      role: result.data.role,
    },
  });

  return res.status(201).json(newEmployee);
}

export async function getEmployees(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated user" });
  }

  if (!req.params.slug) {
    return res.status(400).json({ message: "Slug is mandatory" });
  }

  if (!([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(req.user.role)) {
    return res.status(403).json({ message: "Don't have permission" });
  }

  if(!req.clinic?.id){
    return res.status(404).json({message: 'Clinic not found'})
  }

  const employees = await p.employee.findMany({
    where: { 
      clinica_id: req.clinic.id,
     },
  });

  return res.status(200).json(employees);
}

export async function getEmployeeById(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated user" });
  }

  if (!req.params.slug) {
    return res.status(400).json({ message: "Slug is mandatory" });
  }

  if (!req.params.id) {
    return res.status(400).json({ message: "ID is mandatory" });
  }

  if(!req.clinic?.id){
    return res.status(404).json({message: 'Clinic not found'})
  }


  const result = employeeIdSchema.safeParse({ employee_id: req.params.id });
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues });
  }

  const employee = await p.employee.findUnique({
    where: { id: result.data.employee_id }
  });

  if (!employee || employee.clinica_id !== req.clinic.id) {
    return res
      .status(404)
      .json({ message: "Employee not found in this clinic" });
  }

  const { clinica_id, ...employeeData } = employee;
  clinica_id;
  return res.status(200).json(employeeData);
}

export async function deleteEmployee(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated user" });
  }

  if (!([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(req.user.role)) {
    return res.status(403).json({ message: "Don't have permission" });
  }
  
  if(!req.clinic?.id){
    return res.status(404).json({message: 'Clinic not found'})
  }
  
  if (!req.params.slug) {
    return res.status(400).json({ message: "Slug is mandatory" });
  }

  if (!req.user.clinica_id) {
    return res
      .status(403)
      .json({ message: "User is not linked to any clinic" });
  }

  if (!req.params.id) {
    return res.status(400).json({ message: "ID is mandatory" });
  }

  const result = employeeIdSchema.safeParse({ employee_id: req.params.id });
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues });
  }

  const employee = await p.employee.findUnique({
    where: { id: result.data.employee_id },
  });

  if (!employee || employee.clinica_id !== req.clinic.id) {
    return res
      .status(404)
      .json({ message: "Employee not found in this clinic" });
  }

  await p.employee.delete({ where: { id: result.data.employee_id } });

  return res.status(204).send();
}

export async function updateEmployee(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated user" });
  }

  if (!req.params.slug) {
    return res.status(400).json({ message: "Slug is mandatory" });
  }

  if (!req.user.clinica_id) {
    return res
      .status(403)
      .json({ message: "User is not linked to any clinic" });
  }

  if (!([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(req.user.role)) {
    return res.status(403).json({ message: "Don't have permission" });
  }

  if (!req.params.id) {
    return res.status(400).json({ message: "ID is mandatory" });
  }

  const employee = employeeIdSchema.safeParse({ employee_id: req.params.id });
  if (!employee.success) {
    return res.status(400).json({ message: employee.error.issues });
  }

  const result = employeeUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues });
  }

  const updateEmployee = await p.employee.update({
    where: { id: employee.data.employee_id },
    data: {
      ...(result.data.name && { name: result.data.name }),
      ...(result.data.speciality && { speciality: result.data.speciality }),
    },
  });

  return res.status(200).json(updateEmployee);
}
