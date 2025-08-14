import supertest from 'supertest'
import app from '../app.ts'
import {prisma as p} from '../models/prisma.ts'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.ts'


const api = supertest(app)

let token: string;
let user_id: string;

beforeEach(async () => {
    await p.clinica.deleteMany({})
    await p.user.deleteMany({})

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


describe('Route to create a clinic ', () => {
    test('Create new clinic', async () => {
        const clinic = {
            name: 'Clinica',
            slug: 'clinica',
            contact: '85992833870',
            address: 'rua 1',
            user_id: user_id
        }
        
        await api
          .post('/clinic/create')
          .set('Authorization', `Bearer ${token}`)
          .send(clinic)
          .expect(201)
          .expect('Content-Type', /application\/json/)
    })
    test('Error to create new clinic', async () => {
        const clinic = {
            name: 1,
            slug: 'clinica',
            contact: '85992833870',
            address: 'rua 1',
            user_id: user_id
        }
        
        await api
          .post('/clinic/create')
          .set('Authorization', `Bearer ${token}`)
          .send(clinic)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    })
    test('Error to create new clinic cause user have invalid token', async () => {
        const clinic = {
            name: 1,
            slug: 'clinica',
            contact: '85992833870',
            address: 'rua 1',
            user_id: user_id
        }
        
        await api
          .post('/clinic/create')
          .set('Authorization', `Bearer ${token}a`)
          .send(clinic)
          .expect(403)
          .expect('Content-Type', /application\/json/)
    })
})

describe('Route to update a clinic', ()=> {
    test('Update new clinic', async ()=>{
        
    })
})

afterAll(async () => {
  await p.$disconnect();
});