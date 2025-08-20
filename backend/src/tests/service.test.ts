import supertest from "supertest";
import app from "../app";
import { Role } from '../../generated/prisma/index'
import {prisma as p} from '../models/prisma.ts'
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.ts";

const api = supertest(app)

const _plans = [
  { name: 'BASIC', limit: 1 },
  { name: 'PRO', limit: 3 },
  { name: 'ENTERPRISE', limit: 10 },
];
const roles: Role[] = [Role.SUPERADMIN,Role.USER,Role.MANAGER, Role.EMPLOYEE]

beforeAll(async () =>{
    await p.user.deleteMany({})
    await p.clinica.deleteMany({})
    await p.service.deleteMany({})
})


roles.forEach(role =>{
    describe(`Test service route with role ${role}`, () =>{
        let token: string;
        let clinica_id: string;
        let slug: string;
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
            token = jwt.sign(
                  { id: user.id, name: user.name, role: user.role, plan: user.plan },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                  );

            const clinic = await p.clinica.create({
                data:{
                    name: 'clinica teste',
                    slug: 'clinicaTeste',
                    contact: 'contatoTeste',
                    address: 'addressTeste',
                    user_id: user.id
                }
            })
            token = jwt.sign(
                  { id: user.id, name: user.name, role: user.role, plan: user.plan, clinica_id: clinic.id },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                  );
            clinica_id = clinic.id
            slug = clinic.slug
        })

        test('Route to create service', async ()=>{
            const newService ={
                name: 'serviceTest',
                description: 'descriptionTest',
                price: '10',
                clinica_id: clinica_id
            }
            const expectedStatus = ([Role.USER, Role.SUPERADMIN, Role.MANAGER]as Role[]).includes(role) ? 201 : 403

            await api.post(`/service/create/${slug}`)
               .set('Authorization', `Bearer ${token}`)
               .send(newService)
               .expect(expectedStatus)
        })
    })
})

afterAll(async () => {
  await p.$disconnect();
});