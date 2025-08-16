import type { Request, Response, NextFunction } from "express";

export const errorHandling = (error: unknown,req: Request, res: Response, next: NextFunction) =>{
    
    if(error instanceof Error){
        if('code' in error){
            if (error.name === 'PrismaClientKnownRequestError') {
                if (error.code === 'P2002') {
                    return res.status(409).json({ message: "Already exist." });
                }
                if (error.code === 'P2025') {
                    return res.status(404).json({ message: "Resource not found" });
                }
            }
        }
        
       if (error.name === 'PrismaClientValidationError') {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }
    }
    
    next(error)
    
}