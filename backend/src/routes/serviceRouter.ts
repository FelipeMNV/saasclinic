import express from "express";
import { authenticationToken } from "../middleware/authMiddleware";
import { checkClinic } from "../middleware/checkClinic";
import { createService, deleteService, getServiceById, getServices, updateService } from "../controllers/serviceController";

const serviceRouter = express.Router()

serviceRouter.get('/service/:slug', authenticationToken, checkClinic, getServices)
serviceRouter.get('/service/:slug/:id', authenticationToken, checkClinic, getServiceById)
serviceRouter.post('/service/create/:slug', authenticationToken, checkClinic, createService)
serviceRouter.put('/service/update/:slug/:id', authenticationToken, checkClinic, updateService)
serviceRouter.delete('/service/delete/:slug/:id', authenticationToken, checkClinic, deleteService)

export default serviceRouter