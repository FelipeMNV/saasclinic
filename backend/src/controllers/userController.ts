import type { Request, Response, NextFunction } from "express";
import { prisma as p } from "../models/prisma.ts";
import bcrypt from 'bcryptjs';
import { userSchema, userParamsSchema, loginSchema, updateUserSchema } from "../validators/user.validator.ts";
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET as string;


export async function loginUser(req: Request, res: Response){
  const result = loginSchema.safeParse(req.body)


  if (!result.success){
    return res.status(400).json({message: result.error.issues})
  }

  const { email, password } = result.data;

  const user = await p.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({message: 'Credenciais inválidas'});
  }

  const token = jwt.sign(
    {id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d'}
  );

  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({ message: "Login Realizado com Sucesso",
    token,
    user: userWithoutPassword,
  });
  

}

export async function createUser(req: Request, res: Response) {
    const result = userSchema.safeParse(req.body)


    if (!result.success){
        return res.status(400).json({message: result.error.issues})
    }
        const hashedPassword = await bcrypt.hash(result.data.password, 10);


        const newUser = await p.user.create({
            data: {
                email: result.data.email,
                username: result.data.username,
                password: hashedPassword,
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                clinicas: { select:{ id: true, name: true}}
            },
        });

        return res.status(201).json(newUser)    
}

export async function getUsers(req: Request, res: Response) {
    const users = await p.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return res.status(200).json(users);

}

export async function updateUser(req: Request, res: Response) {
  const paramsResult = userParamsSchema.safeParse(req.params);
  const result = updateUserSchema.safeParse(req.body);

  if (!paramsResult.success){
    return res.status(400).json({message: "User ID is required"});
  }

  if (!result.success) {
    return res.status(400).json({message: result.error.issues});
  }

  const { id } = paramsResult.data;
  const { username, email, password } = result.data;

  const dataToUpdate: any = {};

  if (username) dataToUpdate.username = username;
  if (email) dataToUpdate.email = email;
  if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

  const existingUser = await p.user.findUnique({ where: { id }});
  if (!existingUser) {
    return res.status(404).json({message: "User not found"});
  }

  const updatedUser = await p.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });

  return res.status(200).json(updatedUser);
}


export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;

  if(!id) return res.status(400).json({message: 'ID are required'})

  const user = await p.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, createdAt: true, clinicas: { select:{ id: true, name: true}}}
  });

  if (!user) {
    return res.status(404).json({message: "user not found"});
  }
  return res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({message: "User ID Is required"});
  }

  const user = await p.user.findUnique({where: { id }});

  if (!user) {
    return res.status(404).json({message: "User not found"});
  }

  await p.user.delete({where: { id } });

  return res.status(204).send();
}
