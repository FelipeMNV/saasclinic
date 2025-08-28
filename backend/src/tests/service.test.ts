import supertest from "supertest";
import app from "../app";
import { Role } from '../../generated/prisma/index'
import {prisma as p} from '../models/prisma.ts'
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.ts";


const api = supertest(app)

const roles: Role[] = [Role.SUPERADMIN,Role.USER,Role.MANAGER, Role.EMPLOYEE]


beforeAll(async ()=>{
    await p.service.deleteMany({})
    await p.user.deleteMany({})
    await p.clinica.deleteMany({})
})

roles.forEach(role =>{
    describe(`Test service route with role ${role}`, () =>{
        let token: string;
        let clinica_id: string;
        let slug: string;
        let id: string;
        beforeEach(async ()=>{
            await p.service.deleteMany({})
            await p.user.deleteMany({})
            await p.clinica.deleteMany({})
            const user = await p.user.create({
                data:{
                    name: 'userTest',
                    email: 'emailteste@gmail.com',
                    password: 'senhateste',
                    plan: 'PRO',
                    role: role
                }
            })

            const clinic = await p.clinica.create({
                data:{
                    name: 'clinica teste',
                    slug: 'clinicaTeste',
                    contact: 'contatoTeste',
                    address: 'addressTeste',
                    user_id: user.id
                }
            })

            const service = await p.service.create({
                data:{
                    name: 'serviceTest',
                    description: 'descriptionTest',
                    price: '10',
                    duration: 10,
                    type: 'INDIVIDUAL',
                    capacity: 1,
                    clinica_id: clinic.id
                }
            })
            token = jwt.sign(
                  { id: user.id, name: user.name, role: user.role, plan: user.plan, clinica_id: clinic.id },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                  );
            clinica_id = clinic.id
            slug = clinic.slug
            id = service.id
        })

        test('Route to create a service', async ()=>{
            const newService ={
                name: 'serviceTest2',
                description: 'descriptionTest2',
                price: '10',
                duration: 1,
                type: 'INDIVIDUAL',
                capacity: 1,
                clinica_id: clinica_id
            }
            const expectedStatus = ([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(role) ? 201 : 403

            await api.post(`/service/create/${slug}`)
               .set('Authorization', `Bearer ${token}`)
               .send(newService)
               .expect(expectedStatus)
        })
        test('Route to delete a service', async () =>{
            const expectedStatus = ([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(role) ? 204 : 403

            await api.delete(`/service/delete/${slug}/${id}`)
                     .set('Authorization', `Bearer ${token}`)
                     .expect(expectedStatus)
        })
        test("Route to update a service", async () =>{
            const updateService ={
                name: 'serviceTest3',
                description: 'descriptionTest3',
                price: '10',
            }

            const expectedStatus = ([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(role) ? 200 : 403

            await api
                    .put(`/service/update/${slug}/${id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(updateService)
                    .expect(expectedStatus)
        })
        test("Route to get all services", async ()=>{
            await api
                    .get(`/service/${slug}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
        })
        test("Route to get a service by id", async ()=>{
            await api
                    .get(`/service/${slug}/${id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
        })
    })
})

describe('Service Error test',()=>{
    let token: string;
    let clinica_id: string;
    let slug: string;
    let id: string;
    beforeEach(async ()=>{
            await p.service.deleteMany({})
            await p.user.deleteMany({})
            await p.clinica.deleteMany({})
            const user = await p.user.create({
                data:{
                    name: 'userTest',
                    email: 'emailteste@gmail.com',
                    password: 'senhateste',
                    plan: 'PRO',
                    role: 'USER'
                }
            })

            const clinic = await p.clinica.create({
                data:{
                    name: 'clinica teste',
                    slug: 'clinicaTeste',
                    contact: 'contatoTeste',
                    address: 'addressTeste',
                    user_id: user.id
                }
            })

            const service = await p.service.create({
                data:{
                    name: 'serviceTest',
                    description: 'descriptionTest',
                    price: '10',
                    duration: 1,
                    type: 'INDIVIDUAL',
                    capacity: 1,
                    clinica_id: clinic.id
                }
            })
            token = jwt.sign(
                  { id: user.id, name: user.name, role: user.role, plan: user.plan, clinica_id: clinic.id },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                  );
            clinica_id = clinic.id
            slug = clinic.slug
            id = service.id
    })
    test('Error to create a service',async ()=>{
        const newService = await p.service.create({
                data:{
                    name: '',
                    description: '',
                    price: '10',
                    duration: 1,
                    type: 'INDIVIDUAL',
                    capacity: 1,
                    clinica_id
                }
            })

            await api
                    .post(`/service/create/${slug}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(newService)
                    .expect(400)
    })
    test("Error to update a service", async ()=>{
        const updateService ={ 
                    name: '',
                    description: 'aa',
                    price: '10',
                    duration: 10,
                    type: 'INDIVIDUAL',
                    capacity: 1,
                }
                
            

            await api
                    .put(`/service/update/${slug}/${id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(updateService)
                    .expect(400)
    })
})


afterAll(async () => {
  await p.$disconnect();
});