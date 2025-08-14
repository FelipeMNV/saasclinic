import type { Request, Response, NextFunction } from "express";
import { prisma as p } from "../models/prisma.ts";
import bcrypt from 'bcryptjs';
import { userSchema } from "../validators/user.validator.ts";
import { userParamsSchema } from "../validators/user.validator.ts";


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

export async function updateEmployeeName(req: Request, res: Response){
    const {id , name} = req.body
    if(!id && !name){
        return res.status(400).json({message: 'Name are required'})
    }

    const updatedEmployee = await p.employee.update({
        where: { id },
        data:{
            name
        }
    })

    return res.send(updatedEmployee)
}

export async function updateEmployeeSpeciality(req: Request, res: Response){
    const {id , speciality} = req.body
    if(!id && !speciality){
        return res.status(400).json({message: 'Speciality are required'})
    }

    const updatedEmployee = await p.employee.update({
        where: { id },
        data:{
            speciality
        }
    })

    return res.send(updatedEmployee)
}

export async function updateUser(req: Request, res: Response) {
  const paramsResult = userParamsSchema.safeParse(req.params);
  const result = userSchema.safeParse(req.body)

  if (!paramsResult.success){
    return res.status(400).json({message: "User ID is Required"});
  }

  const { id } = paramsResult.data;

  if (!result.success) {
    return res.status(400).json({message: "At least one field must be provided for update"});
  }
    const { username, email, password } = result.data;
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
