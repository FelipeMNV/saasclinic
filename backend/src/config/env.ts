import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error(" JWT_SECRET Not defined in .env")
}

export const PORT = process.env.PORT 

export const JWT_SECRET: string = jwtSecret;