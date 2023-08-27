import { request, response } from 'express';
import { verifyToken } from '../helpers/generateToken.js';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { MESSAGE_ERROR_RESPONSE } from '../interfaces/message.interface.js';

/* -------------------------------------------------------------------------- */
/*                    CHECK AUTHENTICATE USER | MIDDLEWARE                    */
/* -------------------------------------------------------------------------- */

export const checkAuth = async (req = request, res = response, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            const token = req.headers.authorization.split(' ').pop();
            const { _id } = await verifyToken(token);
            const isValid = mongoose.Types.ObjectId.isValid(_id);

            if (!isValid) {
                res.status(401).json({
                    ok: false,
                    messages: MESSAGE_ERROR_RESPONSE.DEFAULT
                });
            }

            const user = await User.findById(_id).select(
                '-createdAt -updatedAt -__v -conversations'
            );

            req.user = user;

            return next();
        } catch (error) {
            res.status(401).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.DEFAULT
            });
        }
    } else {
        res.status(401).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};
