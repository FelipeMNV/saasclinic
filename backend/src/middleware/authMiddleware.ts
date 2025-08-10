import jwt from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import type { Request, Response, NextFunction } from "express";

interface TokenPayload extends JwtPayload {
    id: string;
    email: string;
}

interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}

export const authenticationToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        return res.status(401).json({message: "Authentication required. No token provided." });

    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded) {
            return res.status(403).json({message: "Invalid or expired token." });
        }

        req.user = decoded as TokenPayload
        next();
    });
};