import express from 'express'
import {
    createClinic,
    deleteClinic,
    getClinicBySlug,
    getClinics,
    updateClinicAddress,
    updateClinicContact,
    updateClinicName,
    updateClinicSlug,

} from '../controllers/clinicController.ts'
import { authenticationToken } from '../middleware/authMiddleware.ts'

const clinicRouter = express.Router()

clinicRouter.post('/clinic/create', createClinic, authenticationToken)
clinicRouter.patch('/clinic/update/name', updateClinicName)
clinicRouter.patch('/clinic/update/slug', updateClinicSlug)
clinicRouter.patch('/clinic/update/contact', updateClinicContact)
clinicRouter.patch('/clinic/update/address', updateClinicAddress)
clinicRouter.get('/clinic/get', getClinics)
clinicRouter.get('/clinic/get/:slug', getClinicBySlug)
clinicRouter.delete('/clinic/delete', deleteClinic)

export default clinicRouter