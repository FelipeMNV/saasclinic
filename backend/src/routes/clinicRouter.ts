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
clinicRouter.put('/clinic/update/address', updateClinic)
clinicRouter.get('/clinic/get', getClinics)
clinicRouter.get('/clinic/get/:slug', getClinicBySlug)
clinicRouter.delete('/clinic/delete', deleteClinic)

export default clinicRouter