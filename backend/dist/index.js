import express from 'express';
import clinicRouter from './routes/clinicRouter.js';
import { errorHandling } from './middleware/errorHandling.js';
import { unknownEndpoint } from './middleware/unknownEndpoint.js';
import userRouter from './routes/userRouter.js';
const app = express();
app.use(express.json());
app.use(clinicRouter);
app.use(userRouter);
app.use(unknownEndpoint);
app.use(errorHandling);
app.listen(3001, () => {
    console.log('Api rodando em porta 3001');
});
//# sourceMappingURL=index.js.map