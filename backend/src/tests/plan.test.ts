import supertest from 'supertest';
import app from '../app';
import { prisma as p} from '../models/prisma';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { Role } from '../../generated/prisma';
import bcrypt from 'bcryptjs'


const api = supertest(app);
const roles = [Role.USER, Role.MANAGER, Role.EMPLOYEE, Role.SUPERADMIN];

describe('Update Plan API', () => {
    roles.forEach((role) => {
        describe(`Role: ${role}`, () => {
            let _userId: string;
            let token: string;

            beforeAll(async () => {
                await p.user.deleteMany()


                const hashedPassword = await bcrypt.hash('Password123@', 10)

                const user = await p.user.create({
                    data: {
                        name: `Test ${role}`,
                        email: `${role.toLowerCase()}@test.com`,
                        password: hashedPassword,
                        role,
                        plan: "FREE",
                    },
                });


                _userId = user.id;

                token = jwt.sign(
                    {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        plan: user.plan,
                    },
                    JWT_SECRET, 
                    { expiresIn: '7d' }
                );
            });

            test('should update plan', async () => {
                const res = await api.put('/api/plan').set('Authorization', `Bearer ${token}`).send({ plan: 'PRO' });


                if (role === Role.USER || role === Role.SUPERADMIN) {
                    expect(res.status).toBe(200);
                } else {
                    expect(res.status).toBe(403);
                }
            })
            test('Should return 401 if no token is provided', async () => {
                const res = await api.put('/api/plan').send({ plan: 'PRO'});
                expect(res.status).toBe(401);
            });
        })
    })
})