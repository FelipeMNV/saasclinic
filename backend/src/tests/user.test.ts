import supertest from 'supertest';
import app from '../app';
import { prisma as p} from '../models/prisma';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { Role } from '../../generated/prisma';
import bcrypt from 'bcryptjs'

const api = supertest(app);
const roles = [Role.USER, Role.MANAGER, Role.EMPLOYEE, Role.SUPERADMIN];

    describe('User api dynamic roles', () => {
        roles.forEach(role=> {
            describe(`Role: ${role}`, () => {
                let userId: string;
                let token: string;
                let hashedPassword: string;


                    beforeAll(async () => {
                    await p.user.deleteMany();

                    hashedPassword = await bcrypt.hash('Password123@', 10);

                    const user = await p.user.create({
                        data: {
                            name: `Test ${role}`,
                            email: `${role.toLowerCase()}@test.com`,
                            password: hashedPassword,
                            role,
                        },
                    });


                    userId = user.id
                    token = jwt.sign({ id: user.id, name: user.name, role: user.role}, JWT_SECRET, { expiresIn: '7d'});
                });

             

                test('Login With Correct Password', async () => {
                    await api.post('/user/login').send({
                        email: `${role.toLowerCase()}@test.com`,
                        password: 'Password123@',
                    }).expect(200);
                });

                test ('Get All users', async () => {
                    const expectedStatus = role === Role.SUPERADMIN ? 200 : 403;
                    await api.get('/user').set('Authorization', `Bearer ${token}`).expect(expectedStatus);
                });

                test ('Update User', async () => {
                    const newUser= {
                        name: `Test ${role}`,
                        email: `${role.toLowerCase()}a@test.com`,
                        password: hashedPassword,
                        role,
                    }
                    const expectedStatus = (role === Role.SUPERADMIN || role === Role.USER) ? 200 : 403;
                    await api
                        .put(`/user/${userId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .send(newUser)
                        .expect(expectedStatus);
                });

                test ('User cannot update another user', async () =>{
                    const otherUser = await p.user.create({
                        data:{
                            name: 'Other user',
                            email: 'other@test.com',
                            password: hashedPassword,
                            role: Role.USER,
                        },
                    });

                    const newData = { name: 'Hacker', email: 'hack@test.com', password: 'Hackpass123@'};
                    const expectedStatus = role === Role.SUPERADMIN ? 200 : 403;

                    await api.put(`/user/${otherUser.id}`).set('Authorization', `Bearer ${token}`).send(newData).expect(expectedStatus)
                })

                test ('Delete User', async () => {
                    const expectedStatus = role === Role.SUPERADMIN || role === Role.USER ? 204 : 403;
                    await api.delete(`/user/${userId}`).set('Authorization', `Bearer ${token}`).expect(expectedStatus);
                })
            })
        })
    })
    describe('Role: USER', () => {
        let userId: string;
        let token: string;
        let hashedPassword: string;

        beforeAll(async () => {
            await p.user.deleteMany();


            hashedPassword = await bcrypt.hash('PasswordTest123@', 10);
            const user = await p.user.create({
                data: {
                    name: 'Test USER',
                    email: 'user@test.com',
                    password: hashedPassword,
                    role: Role.USER,
                },
            });


            userId = user.id;
            token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, {expiresIn: '7d'});
        });

        test('Login with incorrect password', async () =>{
            await api.post('/user/login').send({
                email:'user@test.com',
                password: 'PasswordTest1234@',
            }).expect(401);
        });
        
        test('Update Failed with Wrong Body', async () =>{
            await api.put(`/user/${userId}`).set('Authorization', `Bearer ${token}`).send({ invalidFiled: 'test'}).expect(400);
        });
    })

    describe('Intruder Test', () => {  
        let hashedPassword: string;
        let userId: string;

        let intruderToken: string;
        let IntruderHashPassword: string;

        beforeAll(async () => {
            await p.user.deleteMany();

            hashedPassword = await bcrypt.hash('PasswordTest123@', 10);
            const user = await p.user.create({
                data: {
                    name: 'Test USER',
                    email: 'user@test.com',
                    password: hashedPassword,
                    role: Role.USER,
                },
            });
            
            userId = user.id;
      
            IntruderHashPassword = await bcrypt.hash('PasswordTest1234@', 10);
            const intruder = await p.user.create({
                data: {
                    name: 'Test Intruder',
                    email: 'intruder@test.com',
                    password: IntruderHashPassword,
                    role: Role.USER,
                }
            });
            
            intruderToken = jwt.sign({ id: intruder.id, name: intruder.name, role: intruder.role}, JWT_SECRET, {expiresIn: '7d'});
        });

        test('User cannot update another User', async () => {
            await api.put(`/user/${userId}`).set('Authorization', `Bearer ${intruderToken}`).send({name: 'KarlosRubens'}).expect(403);
        })

        test('User cannot delete another user', async () => {
            await api.delete(`/user/${userId}`).set('Authorization', `Bearer ${intruderToken}`).expect(403);
        });
    })

afterAll(async () => {
    await p.$disconnect();
});
