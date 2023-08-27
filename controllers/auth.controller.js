import { request, response } from 'express';
import slugify from 'slugify';
import { User } from '../models/User.model.js';
import {
    MESSAGE_ERROR_RESPONSE,
    MESSAGE_SUCCESS_RESPONSE
} from '../interfaces/message.interface.js';
import { tokenSign } from '../helpers/generateToken.js';
import { bcryptCompare, bcryptHash } from '../helpers/generateHash.js';

/* -------------------------------------------------------------------------- */
/*                               LOGIN FUNCTION                               */
/* -------------------------------------------------------------------------- */

export const startLogin = async (req = request, res = response, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select(
            '-createdAt -updatedAt -__v -conversations'
        );

        if (!user) {
            return res.status(400).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_EXIST
            });
        }
        const result = await bcryptCompare(password, user.password);

        if (!result) {
            return res.status(401).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.CRENDENTIALS
            });
        }
        const tokenSession = await tokenSign(user);
        return res.status(200).json({
            ok: 'true',
            user: {
                username: user.username,
                name: user.name,
                email: user.email,
                _id: user._id,
                bio: user.bio
            },
            tokenSession
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

/* -------------------------------------------------------------------------- */
/*                              REGISTER FUNCTION                             */
/* -------------------------------------------------------------------------- */
export const startRegister = async (req = request, res = response, next) => {
    const { email, password, name } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.EMAIL_EXIST
            });
        }

        user = User(req.body);
        user.username = slugify(name.toString(), {
            strict: true,
            lower: true
        });
        user.password = await bcryptHash(password);
        await user.save();
        return res.status(200).json({
            ok: 'true',
            messages: MESSAGE_SUCCESS_RESPONSE.REGISTER_SUCCESS
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

/* -------------------------------------------------------------------------- */
/*                               RENEW FUNCTION                               */
/* -------------------------------------------------------------------------- */
export const startRenewToken = async (req = request, res = response, next) => {
    const user = req.user;

    const tokenSession = await tokenSign(user);
    return res.status(200).json({
        ok: 'true',
        user: {
            username: user.username,
            name: user.name,
            email: user.email,
            _id: user._id,
            bio: user.bio
        },
        tokenSession
    });
};
