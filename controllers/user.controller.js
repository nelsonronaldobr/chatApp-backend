import { request, response } from 'express';
import { isValidObjectId } from 'mongoose';
import {
    MESSAGE_ERROR_RESPONSE,
    MESSAGE_SUCCESS_RESPONSE
} from '../interfaces/message.interface.js';
import { User } from '../models/User.model.js';
import slugify from 'slugify';
const startUpdateUserProfile = async (req = request, res = response) => {
    const currentUser = req.user;
    const { userId } = req.params;
    const { username, name, bio } = req.body;
    const isValid = isValidObjectId(userId);
    if (!isValid) {
        return res
            .status(404)
            .json({ ok: false, messages: MESSAGE_ERROR_RESPONSE.ARGUMENT });
    }

    try {
        let user = await User.findById(userId).select(
            '-conversations -friends -friendRequestsSent -friendRequestsReceived -password'
        );

        if (!user) {
            return res.status(400).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_EXIST
            });
        }

        if (user._id.toString() !== currentUser.id.toString()) {
            return res.status(400).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.AUTHORIZATION
            });
        }

        user.name = name;
        user.username = slugify(username, {
            lower: true,
            strict: true
        });
        user.bio = bio;
        await user.save();

        return res.status(200).json({
            ok: true,
            data: { profile: user },
            messages: MESSAGE_SUCCESS_RESPONSE.UPDATE_PROFILE_SUCCESS
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

const startCheckIfUsernameIsValid = async (req = request, res = response) => {
    const { username = '' } = req.body;
    const slug = slugify(username, {
        strict: true,
        lower: true
    });
    try {
        // Verificar si el nuevo username ya está en uso
        const existingUser = await User.findOne({
            username: slug,
            _id: { $ne: req.user.id } // Excluye tu propio ID de usuario
        });

        if (existingUser) {
            return res.status(400).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.DEFAULT
            });
        }
        // Si el nuevo username no está en uso, el usuario puede actualizarlo
        // Aquí puedes realizar el proceso de actualización del nombre de usuario

        return res.status(200).json({
            ok: true,
            message:
                'El nombre de usuario está disponible y se puede actualizar'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};
const startGetUserById = async (req = request, res = response, next) => {
    const { userId } = req.params;
    const currentUser = req.user;
    try {
        const user = await User.findById(userId).select(
            '-conversations -friends -friendRequestsSent -friendRequestsReceived -password'
        );
        if (!user) {
            return res.status(400).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_EXIST
            });
        }

        if (currentUser._id.toString() !== user._id.toString()) {
            return res.status(401).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.DEFAULT
            });
        }

        return res.status(200).json({
            ok: true,
            data: {
                profile: user
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

export {
    startCheckIfUsernameIsValid,
    startUpdateUserProfile,
    startGetUserById
};
