import type { Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import { clinicSlug, clinicRegisterSchema } from "../validators/clinic.validators.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";

export async function createClinic(req: AuthenticatedRequest, res: Response){
    if(!req.user) return res.status(401).json({ message: "Unauthenticated user" });
    if (req.user.plan === '') return res.status(403).json({ message: "You need an active plan to create a clinic" });
    if(req.user.role !== 'USER') return res.status(403).json({message: "Dont't have permission"})

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
            user_id: req.user.id
        },
        select: {
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            createdAt:true,
            employees: { select: {id: true, name: true}} 
        }
    })
    return res.status(201).json(newClinic)
};

export async function updateClinic(req: AuthenticatedRequest, res: Response){
    if (!req.user) return res.status(401).json({ message: "Unauthenticated user" });
    if (!req.params.slug) return res.status(400).json({ message: "Clinic slug is required" });
    if(!(req.user.role === 'USER')) return res.status(403).json({message: "Dont't have permission"})

    const result = clinicRegisterSchema.safeParse(req.body)

    if(!result.success) return res.status(400).json({message: result.error.issues})
    
    const clinic = await p.clinica.findUnique({
        where: { slug: req.params.slug },
    });

    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
    }

    if (clinic.user_id !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this clinic" });
    }

    const updatedClinic = await p.clinica.update({
        where: { slug: req.params.slug },
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
            createdAt:true,
        }
    })

    return res.status(200).json(updatedClinic)
}

export async function getClinicBySlug(req: AuthenticatedRequest, res: Response){
    if (!req.user) return res.status(401).json({ message: "Unauthenticated user" });
    if(!req.params.slug) return res.status(400).json({message: 'Slug not found'})

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
            user_id:true,
            createdAt:true,
            updateAt: true,
            employees: { select: {id: true, name: true}}
        }
    })

    if (!clinic) return res.status(404).json({ message: "Clinic not found" });

    if(req.user.role === 'USER'){
        if (clinic.user_id !== req.user.id) return res.status(403).json({ message: "Don't have permission" });
    }else{
        const user = await p.employee.findUnique({where:{id: req.user.id}})
        if(!user) return res.status(404).json({message: "User not found"})
        if(user.clinica_id !== clinic.id) return res.status(403).json({ message: "Don't have permission" });
    }

    return res.json(clinic)
}
export async function getClinics(req: AuthenticatedRequest, res: Response){
    if (!req.user) return res.status(401).json({ message: "Unauthenticated user" });
    if(!(req.user.role === 'USER')) return res.status(403).json({message: "Dont't have permission"})
    
    const clinics = await p.clinica.findMany({
        where: {user_id: req.user.id },
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            createdAt:true,
            updateAt:true,
            _count:{
                select: {employees:true}
            }
        }
        
    })
    return res.json(clinics)
}
export async function deleteClinic(req: AuthenticatedRequest, res: Response){
    if (!req.user) return res.status(401).json({ message: "Unauthenticated user" });
    if(!(req.user.role === 'USER')) return res.status(403).json({message: "Dont't have permission"})

    const result = clinicSlug.safeParse(req.body)
    if(!result.success) return res.status(400).json({message: result.error.issues})

    const clinic = await p.clinica.findUnique({where:{slug: result.data.slug}})
    if(!clinic) return res.status(404).json({message: 'Clinic not found'})
    if(clinic.user_id !== req.user.id ) return res.status(403).json({message:"Dont't have permission" })
    
    await p.clinica.delete({
        where: {slug: result.data.slug}
    })

    return res.status(204).end()
}