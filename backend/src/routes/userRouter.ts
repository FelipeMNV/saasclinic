import express from 'express'
import { createUser } from '../controllers/userController.ts'

const userRouter = express.Router()

userRouter.post('/user/create', createUser)


export default userRouter