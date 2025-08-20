import express from 'express'
import { updatePlan } from '../controllers/planController.ts'
import { authenticationToken } from '../middleware/authMiddleware.ts'


const planRouter = express.Router()

planRouter.put('/api/plan', authenticationToken, updatePlan);

export default planRouter;