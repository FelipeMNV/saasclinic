import express from 'express';
import clinicRouter from './routes/clinicRouter.ts';
import userRouter from './routes/userRouter.ts';
import employeeRouter from './routes/employeeRouter.ts';
import { errorHandling } from './middleware/errorHandling.ts';
import { unknownEndpoint } from './middleware/unknownEndpoint.ts';
import planRouter from './routes/planRouter';
import serviceRouter from './routes/serviceRouter.ts';

const app = express();

app.use(express.json());
app.use(planRouter)
app.use(clinicRouter)
app.use(userRouter)
app.use(employeeRouter)
app.use(serviceRouter)

app.use(unknownEndpoint)
app.use(errorHandling)

export default app