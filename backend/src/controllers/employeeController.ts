import type { Request, Response} from "express";
import { prisma as p } from "../models/prisma.ts";
import { employeeSchema, employeeIdSchema } from "../validators/employee.validators.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";
import bcrypt from "bcryptjs";

export async function createEmployee(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.role) {
        return res.status(401).json({ message: "Unauthenticated user" });
    }

    const result = employeeSchema.safeParse(req.body)
    
    if (!result.success){
        return res.status(400).json({message: result.error.issues})
    }
   
    if(!(req.user.role === 'USER' ||req.user.role === 'MANAGER' )){
        return res.status(403).json({message: "Dont't have permission"})
    } 

    if(!(req.user.clinica_id)){
        return res.status(400).json({message: "Clinic_id non exis"})
    }
    
    const hashedPassword = await bcrypt.hash(result.data.password, 10);

    const newEmployee = await p.employee.create({
        data: {
            name: result.data.name,
            speciality: result.data.speciality,
            clinica_id: req.user.clinica_id,
            email: result.data.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            speciality: true,
            email: true,
            clinica: { select:{ id: true, name: true}},
            services: { select:{ id: true, name: true}},
        },
    });

    return res.status(201).json(newEmployee)    
}

export async function getEmployees(req: AuthenticatedRequest, res: Response) {
       
    if(!req.user?.clinica_id){
        return res.status(400).json({ message: "User not linked to any clinic" });
    } 

    
    const employees = await p.employee.findMany({
        where: {clinica_id: req.user.clinica_id},
        select: {
        id: true,
        name: true,
        speciality: true,
        email: true,
        createdAt:true,
        updatedAt:true,
        services:{ select:{ id: true , name : true}}
      },
    });

    return res.status(200).json(employees);
}

export async function getEmployeeById(req: AuthenticatedRequest, res: Response) {
    const result = employeeIdSchema.safeParse(req.body);

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
            clinica: { select: { id: true, name: true } },
            services: { select: { id: true, name: true } }
        }
    }); // ADICIONAR APPOINTMENTS DPS

    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json(employee);
}

export async function deleteEmployee(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.role) {
        return res.status(401).json({ message: "Unauthenticated user" });
    }

    const { slug } = req.params;
    if (!slug) {return res.status(400).json({ message: "Clinic slug is required" });}

    const result = employeeIdSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues });
    }

    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required" });
    }

    if (!(req.user.role === 'USER' || req.user.role === 'MANAGER')) {
        return res.status(403).json({ message: "Don't have permission" });
    }

    const clinic = await p.clinica.findUnique({
        where: { slug },
    });

    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
    }

    if (req.user.role === 'USER') {
        if (clinic.user_id !== req.user.id) {
            return res.status(403).json({ message: "You cannot delete employees from another clinic" });
        }
    } else if (req.user.role === 'MANAGER') {

        if (req.user.clinica_id !== clinic.id) {
            return res.status(403).json({ message: "You cannot delete employees from this clinic" });
        }
    }


    await p.employee.delete({ where: { id } });

    return res.status(204).send();
}

export async function updateEmployee(req: AuthenticatedRequest, res: Response){
    if (!req.user?.role) {
        return res.status(401).json({ message: "Unauthenticated user" });
    }
    
    const result = employeeSchema.safeParse(req.body)
    
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues });
    }

    if (!(req.user.role === 'USER' || req.user.role === 'MANAGER')) {
        return res.status(403).json({ message: "Don't have permission" });
    }
    p.clinica.findUnique
    if(req.user.role === 'USER'){
        
    } else {

    }
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

    return res.send(updatedEmployee)
}

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