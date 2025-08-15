import type { Request, Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import { clinicSlug, clinicRegisterSchema, clinicId,clinicUserId } from "../validators/clinic.validators.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";

export async function createClinic(req: AuthenticatedRequest, res: Response){
    const result = clinicRegisterSchema.safeParse(req.body)
    
    if (!req.user?.id) {
        return res.status(400).json({ message: "Usuário não autenticado" });
    }

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
            employees: { select: {id: true, name: true}} 
        }
    })
    return res.status(201).json(newClinic)
};

export async function updateClinic(req: Request, res: Response){
    const result = clinicRegisterSchema.safeParse(req.body)
    const params = clinicId.safeParse(req.params.clinica_id)
    if(!result.success){
        return res.status(400).json({message: result.error.issues})
    }

    if(!params.success){
        return res.status(400).json({message: params.error.issues})
    }
    const updatedClinic = await p.clinica.update({
        where: { id: params.data.clinica_id },
        data:{
            name: result.data.name,
            slug: result.data.slug,
            contact: result.data.contact,
            address: result.data.address
        },
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt:true,
            employees: { select: {id: true, name: true}}
        }
    })

    return res.send(updatedClinic)
}

export async function getClinicBySlug(req: Request, res: Response){
    const result = clinicSlug.safeParse(req.params.slug)

    if(!result.success) return res.status(400).json({message: result.error.issues})

    const clinic = await p.clinica.findUnique({
        where: { slug: result.data.slug },
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt:true,
            employees: { select: {id: true, name: true}}
        }
    })

    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
    }
    return res.json(clinic);
}
export async function getClinics(req: Request, res: Response){
    const result = clinicUserId.safeParse(req.body)
    if(!result.success) return res.status(400).json({message: result.error.issues})
    const clinic = await p.clinica.findMany({
        where: {user_id: result.data.user_id },
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt:true,
            employees: { select: {id: true, name: true}}
        }
    })
    return res.json(clinic)
}
export async function deleteClinic(req: Request, res: Response){
    const result = clinicSlug.safeParse(req.body)
    if(!result.success) return res.status(400).json({message: result.error.issues})
    
    
    await p.clinica.delete({
        where: {slug: result.data.slug}
    })

    return res.status(204).end()
}