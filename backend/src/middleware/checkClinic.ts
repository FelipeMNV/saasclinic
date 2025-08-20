import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";
import { prisma as p } from "../models/prisma.ts";
import { Role } from "../../generated/prisma/index";

export const checkClinic = async (req: AuthenticatedRequest , res: Response, next: NextFunction) =>{
    if(!req.params.slug) {return res.status(404).json({message: 'Slug not found'})}

    const clinic = await p.clinica.findUnique({
            where: { 
                slug: req.params.slug,
                isActive: true 
            }
        })
    
    if (!clinic) {return res.status(404).json({ message: "Clinic not found" });}

    if(req.user?.role !== Role.SUPERADMIN){
        if(req.user?.role === Role.USER){
            if (clinic.user_id !== req.user.id) { return res.status(403).json({ message: "Don't have permission" })}
        }else{
            if(req.user?.clinica_id !== clinic.id) {return res.status(403).json({ message: "Don't have permission" })}
        }
    }
    req.clinic = clinic

    next()
}