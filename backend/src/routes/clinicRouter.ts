import express from 'express'
import {
    createClinic,
    deleteClinic,
    getClinicBySlug,
    getClinics,
    updateClinic

} from '../controllers/clinicController.ts'
import { authenticationToken } from '../middleware/authMiddleware.ts'
import { checkClinic } from '../middleware/checkClinic.ts'

const clinicRouter = express.Router()

clinicRouter.post('/clinic/create',authenticationToken, createClinic)
clinicRouter.put('/clinic/update/:slug',authenticationToken,checkClinic, updateClinic)
clinicRouter.get('/clinic',authenticationToken, getClinics)
clinicRouter.get('/clinic/:slug',authenticationToken,checkClinic, getClinicBySlug) 
clinicRouter.delete('/clinic/delete/:slug',authenticationToken,checkClinic, deleteClinic)

export default clinicRouter