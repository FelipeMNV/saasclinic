import express from "express";
import { authenticationToken } from "../middleware/authMiddleware";
import { checkClinic } from "../middleware/checkClinic";
import { createService, getServiceById, getServices } from "../controllers/serviceController";

const serviceRouter = express.Router()

serviceRouter.get('/service/:slug', authenticationToken, checkClinic, getServices)
serviceRouter.get('/service/:slug/:id', authenticationToken, checkClinic, getServiceById)
serviceRouter.post('/service/create/:slug', authenticationToken, checkClinic, createService)
serviceRouter.put('/service/:slug/:id', authenticationToken, checkClinic, createService)
serviceRouter.delete('/service/delete/:slug/:id', authenticationToken, checkClinic, createService)

export default serviceRouter