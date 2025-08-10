import express from 'express';

const app = express();

app.use(express.json());



app.listen(3001, () => {
    console.log('Api rodando em porta 3001')
})