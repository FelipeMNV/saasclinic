import type { Request, Response } from "express";
import { prisma as p } from "../models/prisma.js";
import { clinicRegisterSchema } from "../validators/clinic.validators.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export async function createClinic(req: AuthenticatedRequest, res: Response){
    const result = clinicRegisterSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({ message: result.error.issues })
    }

    
    const newClinic = await p.clinica.create({
        data: {
        name: result.data.name,
        slug: result.data.slug,
        contact: result.data.contact,
        address: result.data.address,
        user_id: req.user?.id
        },
        select: {
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt:true,
            employees: true
        }
    })
    return res.send(newClinic)
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

    return res.send(updatedClinic)
}
export async function updateClinicSlug(req: Request, res: Response){
    const {id , slug} = req.body
    if(!id && !slug){
        return res.status(400).json({message: 'Contact are required'})
    }

    const updatedClinic = await p.clinica.update({
        where: { id },
        data:{
            slug
        }
    })

    return res.send(updatedClinic)
}
export async function updateClinicContact(req: Request, res: Response){
    const {id , contact} = req.body
    if(!id && !contact){
        return res.status(400).json({message: 'Contact are required'})
    }

    const updatedClinic = await p.clinica.update({
        where: { id },
        data:{
            contact
        }
    })

    return res.send(updatedClinic)
}
export async function updateClinicAddress(req: Request, res: Response){
    const {id , address} = req.body
    if(!id && !address){
        return res.status(400).json({message: 'Contact are required'})
    }

    const updatedClinic = await p.clinica.update({
        where: { id },
        data:{
            address
        }
    })

    return res.send(updatedClinic)
}
export async function getClinicBySlug(req: Request, res: Response){
    const { slug } = req.params
    const clinic = await p.clinica.findUnique({
        where: { slug},
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt:true,
            employees: true
        }
    })

    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
    }
    return res.json(clinic);
}
export async function getClinics(req: Request, res: Response){
    const clinic = await p.clinica.findMany({
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt:true,
            employees: true
        }
    })
    return res.json(clinic)
}
export async function deleteClinic(req: Request, res: Response){
    const { id } = req.body
    if(!id) return res.status(404).json({message: 'ID are required'})
    
    await p.prisma.delete({
        where: {id}
    })
    
    res.status(204).end()
}