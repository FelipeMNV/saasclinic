import type { Request, Response, NextFunction } from "express";
import { prisma as p } from "../models/prisma.js";
import bcrypt from 'bcryptjs';


export async function createUser(req: Request, res: Response, next: NextFunction) {
    const { username, email, password } = req.body;


    if (!username || !email || !password){
        return res.status(400).json({message: "Username, email, and password are required"})
    }
        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = await p.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });

        return res.status(201).json(newUser)    
}
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { username, email, password } = req.body;

  if (!id){
    return res.status(400).json({message: "User ID is Required"});
  }

  if (!username && !email && !password) {
    return res.send(400).json({message: "At least one field must be provided for update"});
  }

    const dataToUpdate: any = {};
  
    if (username) dataToUpdate.username = username;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const existingUser = await p.user.findUnique({where: { id }});
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

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  const user = await p.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, createdAt: true}
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
