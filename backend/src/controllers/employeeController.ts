import type { Request, Response, NextFunction } from "express";
import { prisma as p } from "../models/prisma.ts";
import { employeeSchema } from "../validators/employee.validators.ts";
import { employeeParamsSchema } from "../validators/employee.validators.ts";

export async function createEmployee(req: Request, res: Response) {
    const result = employeeSchema.safeParse(req.body)


    if (!result.success){
        return res.status(400).json({message: result.error.issues})
    }

        const newEmployee = await p.employee.create({
            data: {
                name: result.data.name,
                speciality: result.data.speciality,
                clinica_id: result.data.clinica_id,
            },
            select: {
                id: true,
                name: true,
                speciality: true,
                clinica: { select:{ id: true, name: true}},
                services: { select:{ id: true, name: true}},
            },
        });

        return res.status(201).json(newEmployee)    
}

export async function getEmployees(req: Request, res: Response) {
    const result = employeeParamsSchema.safeParse(req.body)

    if (!result.success){
        return res.status(400).json({message: result.error.issues})
    }
    
    const employees = await p.employee.findMany({
        where: {clinica_id: result.data.clinica_id},
        select: {
        id: true,
        name: true,
        speciality: true,
        createdAt:true,
        updateAt:true,
        services:{ select:{ id: true , name : true}}
      },
    });

    return res.status(200).json(employees);
}

export async function getEmployeeById(req: Request, res: Response) {
  const { id } = req.params;

  if(!id) return res.status(400).json({message: 'ID are required'})

  const employee = await p.employee.findUnique({
    where: { id },
    select: { id: true, name: true, speciality: true, createdAt: true, services: { select:{ id: true, name: true}}}
  });

  if (!employee) {
    return res.status(404).json({message: "employee not found"});
  }
  return res.json(employee);
}

export async function deleteEmployee(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({message: "Employee ID Is required"});
  }

  const employee = await p.employee.findUnique({where: { id }});

  if (!employee) {
    return res.status(404).json({message: "Employee not found"});
  }

  await p.employee.delete({where: { id } });

  return res.status(204).send();
}

export async function updateEmployeeSpeciality(req: Request, res: Response){
    const {id , speciality} = req.body
    if(!id && !speciality){
        return res.status(400).json({message: 'Speciality are required'})
    }

    const updatedEmployee = await p.employee.update({
        where: { id },
        data:{
            speciality
        }
    })

    return res.send(updatedEmployee)}

export async function updateEmployeeName(req: Request, res: Response){
    const {id , name} = req.body
    if(!id && !name){
        return res.status(400).json({message: 'Name are required'})
    }

    const updatedEmployee = await p.employee.update({
        where: { id },
        data:{
            name
        }
    })

    return res.send(updatedEmployee)
}