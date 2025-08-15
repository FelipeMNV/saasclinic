import express from 'express'
import {
    createClinic,
    deleteClinic,
    getClinicBySlug,
    getClinics,
    updateClinic

} from '../controllers/clinicController.ts'
import { authenticationToken } from '../middleware/authMiddleware.ts'

const clinicRouter = express.Router()

clinicRouter.post('/clinic/create',authenticationToken, createClinic)
clinicRouter.put('/clinic/update/:slug',authenticationToken, updateClinic)
clinicRouter.get('/clinic/get',authenticationToken, getClinics)
clinicRouter.get('/clinic/:slug',authenticationToken, getClinicBySlug) 
clinicRouter.delete('/clinic/delete/:slug',authenticationToken, deleteClinic)

export default clinicRouter