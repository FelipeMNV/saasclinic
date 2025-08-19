import type { Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import {
  employeeSchema,
  employeeIdSchema,
  employeeUpdateSchema,
} from "../validators/employee.validators.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";
import bcrypt from "bcryptjs";

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

  const result = employeeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues });
  }

  if (req.user.role === "EMPLOYEE") {
    throw new Error("Employees cannot create new employees");
  }

  const clinic = await p.clinica.findFirst({
    where: { slug: req.params.slug },
  });

  if (!clinic) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  if (req.user.role !== "SUPERADMIN") {
    if (req.user.role === "USER") {
      if (req.user.id !== clinic.user_id) {
        return res
          .status(403)
          .json({ message: "Access denied: not the clinic owner" });
      }
    } else {
      if (req.user.clinica_id !== clinic.id) {
        return res
          .status(403)
          .json({ message: "Access denied: user not linked to this clinic" });
      }
    }
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 10);
  const newEmployee = await p.employee.create({
    data: {
      name: result.data.name,
      speciality: result.data.speciality,
      clinica_id: clinic.id,
      email: result.data.email,
      password: hashedPassword,
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

  if (!req.user.clinica_id) {
    return res
      .status(403)
      .json({ message: "User is not linked to any clinic" });
  }

  const clinic = await p.clinica.findFirst({
    where: { slug: req.params.slug },
  });

  if (!clinic) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  if (req.user.role !== "SUPERADMIN") {
    if (req.user.role === "USER") {
      if (req.user.id !== clinic.user_id) {
        return res
          .status(403)
          .json({ message: "Access denied: not the clinic owner" });
      }
    } else {
      if (req.user.clinica_id !== clinic.id) {
        return res
          .status(403)
          .json({ message: "Access denied: user not linked to this clinic" });
      }
    }
  }

  const employees = await p.employee.findMany({
    where: { clinica_id: clinic.id },
    select: {
      id: true,
      name: true,
      speciality: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      services: { select: { id: true, name: true } },
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

  if (!req.user.clinica_id) {
    return res
      .status(403)
      .json({ message: "User is not linked to any clinic" });
  }

  const clinic = await p.clinica.findFirst({
    where: { slug: req.params.slug },
  });

  if (!clinic) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  if (req.user.role !== "SUPERADMIN") {
    if (req.user.role === "USER") {
      if (req.user.id !== clinic.user_id) {
        return res
          .status(403)
          .json({ message: "Access denied: not the clinic owner" });
      }
    } else {
      if (req.user.clinica_id !== clinic.id) {
        return res
          .status(403)
          .json({ message: "Access denied: user not linked to this clinic" });
      }
    }
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
    select: {
      id: true,
      name: true,
      speciality: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      clinica_id: true,
      clinica: { select: { id: true, name: true } },
      services: { select: { id: true, name: true } },
    },
  });

  if (!employee || employee.clinica_id !== clinic.id) {
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

  if (!req.params.slug) {
    return res.status(400).json({ message: "Slug is mandatory" });
  }

  if (!req.user.clinica_id) {
    return res
      .status(403)
      .json({ message: "User is not linked to any clinic" });
  }

  const clinic = await p.clinica.findFirst({
    where: { slug: req.params.slug },
  });

  if (!clinic) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  if (req.user.role !== "SUPERADMIN") {
    if (req.user.role === "USER") {
      if (req.user.id !== clinic.user_id) {
        return res
          .status(403)
          .json({ message: "Access denied: not the clinic owner" });
      }
    } else if (req.user.role === "MANAGER") {
      if (req.user.clinica_id !== clinic.id) {
        return res.status(403).json({
          message: "Access denied: manager not linked to this clinic",
        });
      }
    } else {
      return res.status(403).json({
        message: "Access denied: you do not have permission to do this action",
      });
    }
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

  if (!employee || employee.clinica_id !== clinic.id) {
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

  const clinic = await p.clinica.findFirst({
    where: { slug: req.params.slug },
  });

  if (!clinic) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  if (req.user.role !== "SUPERADMIN") {
    if (req.user.role === "USER") {
      if (req.user.id !== clinic.user_id) {
        return res
          .status(403)
          .json({ message: "Access denied: not the clinic owner" });
      }
    } else {
      if (req.user.clinica_id !== clinic.id) {
        return res
          .status(403)
          .json({ message: "Access denied: user not linked to this clinic" });
      }
    }
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
    select: {
      id: true,
      name: true,
      speciality: true,
      email: true,
      clinica: { select: { id: true, name: true } },
    },
  });

  return res.status(200).json(updateEmployee);
}
