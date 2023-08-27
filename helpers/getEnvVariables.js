import { config } from 'dotenv';

config();

export const getEnvVariables = () => {
    return {
        PORT: process.env.PORT,
        MONGO_URL: process.env.MONGO_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        FRONTEND_URL: process.env.FRONTEND_URL
    };
};
