import type { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const errorHandling = (error: unknown,req: Request, res: Response, next: NextFunction) =>{
    if (error instanceof PrismaClientKnownRequestError){
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Email already exist." });
        }else(error.code === 'P2025');{
            return res.status(404).json({message: 'Resource not found'})
        };

    }

    if(error instanceof Error){
        console.error(error.message)

      
        
    }
        
    return res.status(500).json({ message: "Internal server error" });
    
}