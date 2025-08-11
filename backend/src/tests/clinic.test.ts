import supertest from 'supertest'
import app from '../index.ts'
import {prisma as p} from '../models/prisma.ts'

const api = supertest(app)

beforeEach(async () => {
    await p.user.create({
       data:{
            username: 'Gustavo',
            email: 'asasasasa@gmail.com',
            password: 'Senhateste#'
       }
    })
})


describe('Testando rota POST /', async () => {
    test('Create new clinic', async () => {
        const clinic = {
            name: 'Clinica',
            slug: 'clinica',
            contact: '85992833870',
            address: 'rua 1',
        }
        api
          .post('/clinic/login')
          .set('Authorization', `Bearer `)
          .send(clinic)
          .expect(201)
          .expect('Content-Type', /application\/json/)
    })
})

afterAll(async () => {
    p.clinica.deleteMany({})
})
