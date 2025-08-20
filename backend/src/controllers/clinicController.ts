import type { Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import { clinicSlug, clinicRegisterSchema } from "../validators/clinic.validators.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";
import { Role } from "../../generated/prisma/index";

export async function createClinic(req: AuthenticatedRequest, res: Response){
    if(!req.user?.plan) {return res.status(401).json({ message: "Unauthenticated user" });}
    if (req.user.plan === 'FREE') {
        throw new Error('You need an active plan to create a clinic')
    }
    if(req.user.role !== Role.USER && req.user.role !== Role.SUPERADMIN) {return res.status(403).json({message: "Dont't have permission"})}

    const parseBody = clinicRegisterSchema.safeParse(req.body)
    
    if(!parseBody.success){
        return res.status(400).json({ message: parseBody.error.issues })
    }

    const newClinic = await p.$transaction(async (tx) => {
      const countClinic = await tx.clinica.count({ where: { user_id: req.user!.id } });

      if(req.user?.role !== Role.SUPERADMIN){
        if ((req.user!.plan === 'BASIC' || req.user!.plan === 'UNIQUE') && countClinic >= 1) {
            throw new Error('You have reached the limit of your BASIC plan. Upgrade to create new clinics.')
        } else if (req.user!.plan === 'PRO' && countClinic >= 3) {
            throw new Error('You have reached the limit of your PRO plan. Upgrade to create new clinics.')
        } else if (req.user!.plan === 'ENTERPRISE' && countClinic >= 10) {
            throw new Error('You have reached the limit of your ENTERPRISE plan. Contact us to create new clinics.')
        }
      }

      return await tx.clinica.create({
        data: {
          ...parseBody.data,
          user_id: req.user!.id
        }
      });
    });
    return res.status(201).json(newClinic)
};

export async function updateClinic(req: AuthenticatedRequest, res: Response){
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}
    if (!req.params.slug) {return res.status(400).json({ message: "Clinic slug is required" });}
    if(!(req.user.role  === Role.USER || req.user.role === Role.SUPERADMIN)) {return res.status(403).json({message: "Dont't have permission"})}

    const result = clinicRegisterSchema.safeParse(req.body)

    if(!result.success) {return res.status(400).json({message: result.error.issues})}
      
    const updatedClinic = await p.clinica.update({
        where: { 
            slug: req.params.slug,
            isActive: true
         },
        data:{
            ...result.data
        },
    })

    return res.status(200).json(updatedClinic)
}

export async function getClinicBySlug(req: AuthenticatedRequest, res: Response){
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}

    const result = clinicSlug.safeParse(req.params.slug)

    if(!result.success) {return res.status(400).json({message: result.error.issues})}
          

    return res.status(200).json(req.clinic)
}

export async function getClinics(req: AuthenticatedRequest, res: Response){
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}
    if(!(req.user.role === Role.USER || req.user.role === Role.SUPERADMIN)) {throw new Error("Dont't have permission")}
    
    const clinics = await p.clinica.findMany({
        where: {
            user_id: req.user.id,
            isActive: true 
        }, 
    })
    return res.status(200).json(clinics);
}

export async function deleteClinic(req: AuthenticatedRequest, res: Response){
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}
    if(!(req.user.role === Role.USER || req.user.role === Role.SUPERADMIN)) {throw new Error("Dont't have permission")}

    if(!req.clinic?.slug){
        return res.status(404).json({message: 'Slug not found'})
    }
 
    await p.clinica.delete({
        where: {
            slug: req.clinic.slug,
            isActive: true
        }
    })

    return res.status(204).end()
}