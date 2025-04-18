import dotenv from 'dotenv';
dotenv.config();

export default {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET
};
