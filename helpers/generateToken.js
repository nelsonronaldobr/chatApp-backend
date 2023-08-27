import jwt from 'jsonwebtoken';
import { getEnvVariables } from './getEnvVariables.js';

const { JWT_SECRET } = getEnvVariables();

/* -------------------------------------------------------------------------- */
/*                             SIGN TOKEN SESSION                             */
/* -------------------------------------------------------------------------- */
export const tokenSign = ({ _id, name }) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { _id, name },
            JWT_SECRET,
            { expiresIn: '2h' },
            (error, token) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            }
        );
    });
};

/* -------------------------------------------------------------------------- */
/*                            VERIFY TOKEN SESSION                            */
/* -------------------------------------------------------------------------- */
export const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
            if (error) {
                reject(error);
            } else {
                resolve(decodedToken);
            }
        });
    });
};
