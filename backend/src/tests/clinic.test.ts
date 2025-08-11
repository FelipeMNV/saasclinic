import supertest from 'supertest'
import app from '../index.ts'
import {prisma as p} from '../models/prisma.ts'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.ts'


const api = supertest(app)

let token: string;
let user_id: string;

beforeEach(async () => {
    const user = await p.user.create({
       data:{
            username: 'Gustavo',
            email: 'asasasasa@gmail.com',
            password: 'Senhateste#'
       }
    })
    user_id = user.id
    token = jwt.sign(
            { id: user.id , email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    
})


describe('Route ', async () => {
    test('Create new clinic', async () => {
        const clinic = {
            name: 'Clinica',
            slug: 'clinica',
            contact: '85992833870',
            address: 'rua 1',
            user_id: user_id
        }
        
        api
          .post('/clinic/create')
          .set('Authorization', `Bearer ${token}`)
          .send(clinic)
          .expect(201)
          .expect('Content-Type', /application\/json/)
    })
})

afterAll(async () => {
    p.clinica.deleteMany({})
})
