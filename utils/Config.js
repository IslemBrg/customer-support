import dotenv from 'dotenv';
dotenv.config();

export default {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    mjEmail: process.env.MAILJET_FROM_EMAIL,
    mjSecret: process.env.MAILJET_API_SECRET,
    mjApiKey: process.env.MAILJET_API_KEY,
};
