import type { Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import { clinicSlug, clinicRegisterSchema } from "../validators/clinic.validators.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";

//  FALTA PESQUISAR SOMENTE CLINICAS QUE ESTÃO ATIVAS

export async function createClinic(req: AuthenticatedRequest, res: Response){
    if(!req.user?.plan) {return res.status(401).json({ message: "Unauthenticated user" });}
    if (req.user.plan === 'FREE' || (!(['BASIC','PRO','ENTERPRISE'].includes(req.user.plan)))) {
        return res.status(403).json({ message: "You need an active plan to create a clinic" });
    }
    if(req.user.role !== 'USER') {return res.status(403).json({message: "Dont't have permission"})}

    const parseBody = clinicRegisterSchema.safeParse(req.body)
    
    if(!parseBody.success){
        return res.status(400).json({ message: parseBody.error.issues })
    }

    const newClinic = await p.$transaction(async (tx) => {
      const countClinic = await tx.clinica.count({ where: { user_id: req.user!.id } });

      if (req.user!.plan === 'BASIC' && countClinic >= 1) {
        return res.status(403).json({message: 'You have reached the limit of your BASIC plan. Upgrade to create new clinics.'});
      } else if (req.user!.plan === 'PRO' && countClinic >= 3) {
        return res.status(403).json({message: 'You have reached the limit of your PRO plan. Upgrade to create new clinics.'});
      } else if (req.user!.plan === 'ENTERPRISE' && countClinic >= 10) {
        return res.status(403).json({message: 'You have reached the limit of your ENTERPRISE plan. Contact us to create new clinics.'});
      }

      return tx.clinica.create({
        data: {
          name: parseBody.data.name,
          slug: parseBody.data.slug,
          contact: parseBody.data.contact,
          address: parseBody.data.address,
          user_id: req.user!.id
        },
        select: {
          id: true,
          name: true,
          slug: true,
          contact: true,
          address: true,
          createdAt: true,
          employees: { select: { id: true, name: true } }
        }
      });
    });
    return res.status(201).json(newClinic)
};

export async function updateClinic(req: AuthenticatedRequest, res: Response){
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}
    if (!req.params.slug) {return res.status(400).json({ message: "Clinic slug is required" });}
    if(!(req.user.role === 'USER')) {return res.status(403).json({message: "Dont't have permission"})}

    const result = clinicRegisterSchema.safeParse(req.body)

    if(!result.success) {return res.status(400).json({message: result.error.issues})}
    
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
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}
    if(!req.params.slug) {return res.status(400).json({message: 'Slug not found'})}

    const result = clinicSlug.safeParse(req.params.slug)

    if(!result.success) {return res.status(400).json({message: result.error.issues})}
          
    const clinic = await p.clinica.findUnique({
        where: { slug: result.data },
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id:true,
            createdAt:true,
            updatedAt: true,
            employees: { select: {id: true, name: true}}
        }
    })

    if (!clinic) {return res.status(404).json({ message: "Clinic not found" });}

    if(req.user.role === 'USER'){
        if (clinic.user_id !== req.user.id) {return res.status(403).json({ message: "Don't have permission" });}
    }else{
        if(req.user.clinica_id !== clinic.id) {return res.status(403).json({ message: "Don't have permission" });}
    }

    return res.status(200).json(clinic)
}
export async function getClinics(req: AuthenticatedRequest, res: Response){
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}
    if(!(req.user.role === 'USER')) {return res.status(403).json({message: "Dont't have permission"})}
    
    const clinics = await p.clinica.findMany({
        where: {user_id: req.user.id },
        select:{
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            createdAt:true,
            updatedAt:true,
            _count:{
                select: {employees:true}
            }
        }
        
    })
    return res.json(clinics)
}
export async function deleteClinic(req: AuthenticatedRequest, res: Response){
    if (!req.user) {return res.status(401).json({ message: "Unauthenticated user" });}
    if(!(req.user.role === 'USER')) {return res.status(403).json({message: "Dont't have permission"})}

    const result = clinicSlug.safeParse(req.params.slug)
    if(!result.success) {return res.status(400).json({message: result.error.issues})}

    const clinic = await p.clinica.findUnique({where:{slug: result.data}})
    if(!clinic) {return res.status(404).json({message: 'Clinic not found'})}
    if(clinic.user_id !== req.user.id ) {return res.status(403).json({message:"Dont't have permission" })}
    
    await p.clinica.delete({
        where: {slug: result.data}
    })

    return res.status(204).end()
}