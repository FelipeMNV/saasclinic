import express from 'express';
import { createUser } from '../controllers/userController.js';
const userRouter = express.Router();
userRouter.post('/user/create', createUser);
export default userRouter;
//# sourceMappingURL=userRouter.js.map