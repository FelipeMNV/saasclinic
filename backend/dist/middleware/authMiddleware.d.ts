import type { JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
interface TokenPayload extends JwtPayload {
    id: string;
    email: string;
}
export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}
export declare const authenticationToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map