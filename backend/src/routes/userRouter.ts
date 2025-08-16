import express from 'express'
import { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser } from '../controllers/userController.ts'
import { authenticationToken } from '../middleware/authMiddleware.ts'


const userRouter = express.Router()

userRouter.post('/user/create', createUser);
userRouter.post('/user/login', loginUser);

userRouter.get('/user', authenticationToken, getUsers);
userRouter.get('/user/:id', authenticationToken, getUserById)
userRouter.put('/user/:id', authenticationToken, updateUser);
userRouter.delete('/user/:id', authenticationToken, deleteUser);

export default userRouter