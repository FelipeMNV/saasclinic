import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
export declare function createClinic(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateClinicName(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateClinicSlug(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateClinicContact(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateClinicAddress(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getClinicBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getClinics(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteClinic(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=clinicController.d.ts.map