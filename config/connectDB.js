import mongoose from 'mongoose';
import { getEnvVariables } from '../helpers/getEnvVariables.js';

/**
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 *
 */
const { MONGO_URL } = getEnvVariables();

/* -------------------------------------------------------------------------- */
/*                                CONNECTION DB                               */
/* -------------------------------------------------------------------------- */
mongoose.set('strictQuery', false); // Configuración para suprimir la advertencia

export const connectDB = async () => {
    try {
        const cnx = await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`DB conectada en ${cnx.connection.name}`);
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }
};
