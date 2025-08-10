import type { Request, Response } from "express";
import { prisma as p } from "../models/prisma.js";
import { clinicRegisterSchema } from "../validators/clinic.validators.js";

export async function createClinic(req: Request, res: Response){
    const result = clinicRegisterSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({ message: result.error.issues })
    }


    const newClinic = await p.clinica.create({
        data: {
        name: result.data.name,
        contact: result.data.contact,
        address: result.data.address  
        },
        select: {
            id: true,
            name: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt:true,
            employees: true
        }
    })
    res.send(newClinic)
};

export async function updateClinicName(req: Request, res: Response){
    const {id , name} = req.body
    if(!id && !name){
        return res.status(400).json({message: 'Name are required'})
    }

    const updatedClinic = await p.clinica.update({
        where: { id },
        data:{
            name
        }
    })
}