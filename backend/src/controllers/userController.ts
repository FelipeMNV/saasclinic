import type { Request, Response } from "express";
import { prisma as p } from "../models/prisma.ts";
import bcrypt from 'bcryptjs';
import { userSchema, userParamsSchema, loginSchema, updateUserSchema } from "../validators/user.validator.ts";
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest, TokenPayload } from "../middleware/authMiddleware.ts";
import type { User } from '../../generated/prisma';

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
    {id: user.id, name: user.name, role: user.role, plan: user.plan},
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
                name: result.data.name,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                clinicas: { select:{ id: true, name: true}}
            },
        });

        return res.status(201).json(newUser)    
}

export async function getUsers(req: AuthenticatedRequest, res: Response) {
    if(req.user?.role !== 'SUPERADMIN'){
      return res.status(403).json({ message: 'Access denied: Only platform administrators can list all users.'})
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    p.user.findMany({
      take: limit,
      skip: skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
    p.user.count(),
  ]);


    return res.status(200).json({
      data: users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limitPerPage: limit,
      },
    });
}

export async function updateUser(req: AuthenticatedRequest, res: Response) { 
  if(req.user?.role !== 'USER' &&  req.user?.role !== 'SUPERADMIN'){
    throw new Error("Don't have permission")
  }

  const paramsResult = userParamsSchema.safeParse(req.params); 
  

  if (!paramsResult.success){
    return res.status(400).json({message: "User ID is required"});
  }
  const result = updateUserSchema.safeParse(req.body);
  
  const { id } = paramsResult.data; 
  
  if (!result.success) {
    return res.status(400).json({message: result.error.issues});
  }
  
  if (req.user?.role !== 'SUPERADMIN' && req.user?.id !== id) {
    return res.status(403).json({ message: "Access Denied" });
  }


  const { name, email, password } = result.data;
  
  const dataToUpdate: any = {};

  if (name) {dataToUpdate.name = name;}
  if (email) {dataToUpdate.email = email;}
  if (password) {dataToUpdate.password = await bcrypt.hash(password, 10);}

  const existingUser = await p.user.findUnique({ where: { id }});
  if (!existingUser) {
    return res.status(404).json({message: "User not found"});
  }

  const updatedUser = await p.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return res.status(200).json(updatedUser);
}


export async function getUserById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params; 


  if(!id) {return res.status(400).json({message: 'ID are required'})}
  
  if (req.user?.role !== "SUPERADMIN"){
    throw new Error('Access denied: Only SUPERADMIN can access this resource.')
  }

  const user = await p.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true, clinicas: { select:{ id: true, name: true}}}
  });

  if (!user) {
    return res.status(404).json({message: "user not found"});
  }
  return res.json(user);
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  if(req.user?.role !== 'USER' &&  req.user?.role !== 'SUPERADMIN'){
    throw new Error("Don't have permission")
  }

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (id !== req.user.id){
    throw new Error('Access Denied')
  }

  await p.user.delete({ where: { id } });

  return res.status(204).end();
}
