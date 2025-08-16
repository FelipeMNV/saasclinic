import supertest from 'supertest'
import app from '../app.ts'
import {prisma as p} from '../models/prisma.ts'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.ts'
import { Role } from '../../generated/prisma/index'


const api = supertest(app)

 
const plans = [
  { name: 'BASIC', limit: 1 },
  { name: 'PRO', limit: 3 },
  { name: 'ENTERPRISE', limit: 10 },
];
const roles: Role[] = [Role.SUPERADMIN,Role.USER,Role.MANAGER, Role.EMPLOYEE]

plans.forEach(({ name, limit }) => {
  roles.forEach(role =>{
    describe(`Clinic creation - ${name} plan`, () => {
    let token: string;
    let user_id: string;
    beforeEach(async () => {
      await p.clinica.deleteMany({});
      await p.user.deleteMany({});

      const user = await p.user.create({
        data: {
          name: `User_${name}`,
          email: `user_${name.toLowerCase()}@gmail.com`,
          password: 'Senhateste#',
          plan: name,
          role: role
        }
      });

      user_id = user.id;
      token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, plan: user.plan },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    });

    test(`Create up to limit (${limit}) clinics`, async () => {
      for (let i = 1; i <= limit; i++) {
        const clinic = {
          name: `Clinic_${i}`,
          slug: `clinic_${i}`,
          contact: `85992833${i}0`,
          address: `Rua ${i}`,
          user_id,
        };
        const expectStatus = (role === 'USER' || role === 'SUPERADMIN') ? 201 : 403
        await api
          .post('/clinic/create')
          .set('Authorization', `Bearer ${token}`)
          .send(clinic)
          .expect(expectStatus);
      }
    });
    test('Error to create new clinic because zod validation', async () => {
        const clinic = {
            name: 1,
            slug: 'clinica',
            contact: '85992833870',
            address: 'rua 1',
            user_id: user_id
        }
        const expectStatus =  (role === 'USER' || role === 'SUPERADMIN') ? 400 : 403
        await api
          .post('/clinic/create')
          .set('Authorization', `Bearer ${token}`)
          .send(clinic)
          .expect(expectStatus)
          .expect('Content-Type', /application\/json/)
    })
    test('Error to create new clinic because user have invalid token', async () => {
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

    test('Error when trying to create clinic above limit', async () => {
      for (let i = 1; i <= limit; i++) {
        await p.clinica.create({
          data: {
            name: `Clinic_${i}`,
            slug: `clinic_${i}`,
            contact: `85992833${i}0`,
            address: `Rua ${i}`,
            user_id,
          }
        });
      }

      const extraClinic = {
        name: 'ExtraClinic',
        slug: 'extra_clinic',
        contact: '8599999999',
        address: 'Rua Extra',
        user_id,
      };
      const expectedStatus = role === 'SUPERADMIN' ? 201 : 403
      await api
        .post('/clinic/create')
        .set('Authorization', `Bearer ${token}`)
        .send(extraClinic)
        .expect(expectedStatus)
        .expect('Content-Type', /application\/json/);
    });
  });
  })
});

roles.forEach(role =>{
    describe('Route to update clinic', ()=>{
    let token: string;
    let user_id: string;
    let originalSlug: string;
    beforeAll(async () => {
      await p.clinica.deleteMany({});
      await p.user.deleteMany({});

      const user = await p.user.create({
        data: {
          name: `User_test`,
          email: `user_test@gmail.com`,
          password: 'Senhateste#',
          plan: 'BASIC',
          role: role
        }
      });

      user_id = user.id;
      token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, plan: user.plan },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const clinic = await p.clinica.create({
            data:{
                name: 'clinica',
                slug: 'clinica',
                contact: '85992833870',
                address: 'rua 1',
                user_id: user_id
            }
        })
       originalSlug = clinic.slug
    });
    test('Test to update a clinic', async()=>{
        const clinicToUpdate = {
            name: 'clinica2',
            slug: 'clinica2',
            contact: '85992833870',
            address: 'rua 2',
            user_id: user_id
        }
        const expectStatus =  (role === 'USER' || role === 'SUPERADMIN') ? 200 : 403
        await api
            .put(`/clinic/update/${originalSlug}`)
            .set('Authorization', `Bearer ${token}`)
            .send(clinicToUpdate)
            .expect(expectStatus)
    })
})
})

describe('Route te get clinic by slug', () =>{
    let token: string;
    let user_id: string;
    let originalSlug: string;
    beforeAll(async () => {
      await p.clinica.deleteMany({});
      await p.user.deleteMany({});

      const user = await p.user.create({
        data: {
          name: `User_test`,
          email: `user_test@gmail.com`,
          password: 'Senhateste#',
          plan: 'BASIC',
        }
      });

      user_id = user.id;
      token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, plan: user.plan },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const clinic = await p.clinica.create({
            data:{
                name: 'clinica',
                slug: 'clinica',
                contact: '85992833870',
                address: 'rua 1',
                user_id: user_id
            }
        })
       originalSlug = clinic.slug
    });
    test('Get clinic by slug successfull', async ()=>{
        await api
          .get(`/clinic/${originalSlug}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
    })
})

roles.forEach(role =>{
    describe('Route te get clinic', () =>{
    let token: string;
    let user_id: string;

    beforeAll(async () => {
      await p.clinica.deleteMany({});
      await p.user.deleteMany({});

      const user = await p.user.create({
        data: {
          name: `User_test`,
          email: `user_test@gmail.com`,
          password: 'Senhateste#',
          plan: 'BASIC',
          role: role
        }
      });

      user_id = user.id;
      token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, plan: user.plan },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      await p.clinica.create({
            data:{
                name: 'clinica',
                slug: 'clinica',
                contact: '85992833870',
                address: 'rua 1',
                user_id: user_id
            }
        })
    });
    test('Get clinic', async ()=>{
        const expectStatus =  (role === 'USER' || role === 'SUPERADMIN') ? 200 : 403
        await api
          .get(`/clinic`)
          .set('Authorization', `Bearer ${token}`)
          .expect(expectStatus)
    })
})
})

roles.forEach(role =>{
    describe('Route te get clinic', () =>{
    let token: string;
    let user_id: string;
    let originalSlug: string;
    beforeAll(async () => {
      await p.clinica.deleteMany({});
      await p.user.deleteMany({});

      const user = await p.user.create({
        data: {
          name: `User_test`,
          email: `user_test@gmail.com`,
          password: 'Senhateste#',
          plan: 'BASIC',
          role: role
        }
      });

      user_id = user.id;
      token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, plan: user.plan },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const clinic = await p.clinica.create({
            data:{
                name: 'clinica',
                slug: 'clinica',
                contact: '85992833870',
                address: 'rua 1',
                user_id: user_id
            }
        })
      originalSlug = clinic.slug
    });
    test('Delete clinic', async ()=>{
        const expectStatus =  (role === 'USER' || role === 'SUPERADMIN') ? 204 : 403
        await api
          .delete(`/clinic/delete/${originalSlug}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(expectStatus)
    })
})
})

describe('Test intruder', () =>{
    let tokenIntruder: string;
    let user_id: string;
    let originalSlug: string;
    beforeEach(async ()=>{
        await p.clinica.deleteMany({});
        await p.user.deleteMany({});

        const user = await p.user.create({
        data: {
          name: `User_test`,
          email: `user_test@gmail.com`,
          password: 'Senhateste#',
          plan: 'BASIC',
        }
        });

        user_id = user.id;    

        const userIntruder = await p.user.create({
        data: {
          name: `User_intruder`,
          email: `user_intruder@gmail.com`,
          password: 'Senhateste#',
          plan: 'BASIC',
        }
        });

        tokenIntruder = jwt.sign(
        { id: userIntruder.id, name: userIntruder.name, role: userIntruder.role, plan: userIntruder.plan },
        JWT_SECRET,
        { expiresIn: '7d' }
        );
        const clinic = await p.clinica.create({
            data:{
                name: 'clinica',
                slug: 'clinica',
                contact: '85992833870',
                address: 'rua 1',
                user_id: user_id
            }
        })
        originalSlug = clinic.slug
    })
    test('Intruder delete clinic', async ()=>{
        
        await api
          .delete(`/clinic/delete/${originalSlug}`)
          .set('Authorization', `Bearer ${tokenIntruder}`)
          .expect(403)
    })
    test('Intruder Get clinic by slug', async ()=>{
        await api
          .get(`/clinic/${originalSlug}`)
          .set('Authorization', `Bearer ${tokenIntruder}`)
          .expect(403)
    })
    test('Intruder update a clinic', async()=>{
        const clinicToUpdate = {
            name: 'clinica2',
            slug: 'clinica2',
            contact: '85992833870',
            address: 'rua 2',
            user_id: user_id
        }
        await api
            .put(`/clinic/update/${originalSlug}`)
            .set('Authorization', `Bearer ${tokenIntruder}`)
            .send(clinicToUpdate)
            .expect(403)
    })
})


afterAll(async () => {
  await p.$disconnect();
});

