import type { Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";
import { Role } from "../../generated/prisma/index";
import { createServiceSchema, updateServiceSchema } from "../validators/service.validators.ts";
import { Decimal } from "@prisma/client/runtime/library";

export const getServices = async (req: AuthenticatedRequest, res: Response) =>{
    if(!req.clinic?.id){
        return res.status(404).json({message: 'Clinic not found'})
    }
      
    const services = await p.service.findMany({
           where:{
             clinica_id: req.clinic.id
           }})

    return res.status(200).json(services)
}

export const getServiceById = async (req: AuthenticatedRequest, res: Response) =>{
    if(!req.clinic?.id){
        return res.status(404).json({message: 'Clinic not found'})
    }

    const {id} = req.body.id
      
    const services = await p.service.findUnique({
           where:{
             id
           }})

    return res.status(200).json(services)

}

export const createService = async(req: AuthenticatedRequest, res: Response) =>{
    if(!req.user){
        return res.status(401).json({message: 'Unauthenticated user'})
    }
    if(!req.clinic?.id){
        return res.status(404).json({message: 'Clinic not found'})
    }

    if (!([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(req.user.role)) {
        return res.status(403).json({ message: "Don't have permission" });
    }
    const result = createServiceSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({message: result.error.issues})
    }

    const newService = p.service.create({
        data:{
            ...result.data,
            clinica_id: req.clinic.id
        }
    })

    return res.status(201).json(newService)
}

export const updateService = async (req: AuthenticatedRequest, res: Response) =>{
    if(!req.user){
        return res.status(401).json({message: 'Unauthenticated user'})
    }

    if (!([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(req.user.role)) {
        return res.status(403).json({ message: "Don't have permission" });
    }

    const result = updateServiceSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({message: result.error.issues})
    }
    const {description, name , price} = result.data

    const dataUpdated: any = {}

    if(description){dataUpdated.description = description}
    if(name){dataUpdated.name = name}
    if(price){dataUpdated.price = new Decimal(price)}

    await p.service.update({
        where:{
            id: result.data.id
        },
        data: {                    
            ...dataUpdated
        }
    })
}

export const deleteService= async (req: AuthenticatedRequest, res: Response) =>{
    if(!req.clinic?.id){
        return res.status(404).json({message: 'Clinic not found'})
    }
    if(!req.user){
        return res.status(401).json({message: 'Unauthenticated user'})
    }
    if (!([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(req.user.role)) {
        return res.status(403).json({ message: "Don't have permission" });
    }

    const {id} = req.body.id
    await p.service.delete({
        where:{
            id
        }
    })
    return res.status(204).end()
}