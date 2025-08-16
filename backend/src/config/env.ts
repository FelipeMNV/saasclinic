import dotenv from "dotenv";
import { envSchema } from "../validators/env.validator"


dotenv.config({path: process.env.NODE_ENV === 'test' ?  '.env.test' : '.env'});


const env = envSchema.safeParse(process.env)

if (!env.success){
  console.error('❌ Invalid environment variables:', env.error.format());
  throw new Error("Environment validation failed. ")
}

export const JWT_SECRET = env.data.JWT_SECRET;
export const PORT = env.data.PORT ?? '3000';