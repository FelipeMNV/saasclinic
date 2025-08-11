import express from 'express';
import clinicRouter from './routes/clinicRouter.ts';
import { errorHandling } from './middleware/errorHandling.ts';
import { unknownEndpoint } from './middleware/unknownEndpoint.ts';
import userRouter from './routes/userRouter.ts';

const app = express();

app.use(express.json());

app.use(clinicRouter)
app.use(userRouter)

app.use(unknownEndpoint)
app.use(errorHandling)

export default app