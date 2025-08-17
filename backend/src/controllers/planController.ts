import type { Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET as string;

const PLANS_LIMITS: Record<string, number | null> = {
    FREE: 0,
    BASIC: 1,
    PRO: 5,
    ENTERPRISE: 10,
};

export async function updatePlan(req: AuthenticatedRequest, res: Response){
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthenticated user" });

    const { plan } = req.body as { plan: keyof typeof PLANS_LIMITS};
    if(!plan || !(plan in PLANS_LIMITS)) {
        return res.status(400).json({ message: 'Invalid Plan'})
    }


    const updatedUser = await p.user.update({
        where: {id: user.id},
        data: { plan },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            plan: true,
            createdAt: true,
            updatedAt: true,
        },
    });


    const token = jwt.sign({
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        plan: updatedUser.plan,
    },

    JWT_SECRET, {expiresIn: '7d'}
    );
    
    return res.status(200).json({
        message: "Plan updated successfully", token, user: updatedUser,
    });
}