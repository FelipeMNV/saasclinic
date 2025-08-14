import express from 'express';
import clinicRouter from './routes/clinicRouter.ts';
import userRouter from './routes/userRouter.ts';
import employeeRouter from './routes/employeeRouter.ts';
import { errorHandling } from './middleware/errorHandling.ts';
import { unknownEndpoint } from './middleware/unknownEndpoint.ts';

const app = express();

app.use(express.json());

app.use(clinicRouter)
app.use(userRouter)
app.use(employeeRouter)

app.use(unknownEndpoint)
app.use(errorHandling)

export default app