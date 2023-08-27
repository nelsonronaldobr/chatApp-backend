import { request, response } from 'express';
import { isValidObjectId } from 'mongoose';
import {
    MESSAGE_ERROR_RESPONSE,
    MESSAGE_SUCCESS_RESPONSE
} from '../interfaces/message.interface.js';
import { User } from '../models/User.model.js';
import { FriendRequest } from '../models/FriendRequest.model.js';

const startCreateFriendRequest = async (req = request, res = response) => {
    const { receiver } = req.body;

    const isValid = isValidObjectId(receiver);

    if (!isValid) {
        return res
            .status(404)
            .json({ ok: false, messages: MESSAGE_ERROR_RESPONSE.ARGUMENT });
    }

    try {
        const [user, currentUser] = await Promise.all([
            User.findById(receiver),
            User.findById(req.user.id)
        ]);

        if (!user) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_FOUND(id)
            });
        }

        const friendRequest = new FriendRequest();
        friendRequest.sender = currentUser._id;
        friendRequest.receiver = user._id;

        const [savedFriendRequest, updatedCurrentUser, updatedUser] =
            await Promise.all([
                friendRequest.save(),
                User.updateOne(
                    { _id: currentUser._id },
                    { $push: { friendRequestsSent: friendRequest._id } }
                ),
                User.updateOne(
                    { _id: user._id },
                    { $push: { friendRequestsReceived: friendRequest._id } }
                )
            ]);

        return res.status(200).json({
            ok: true,
            messages: MESSAGE_SUCCESS_RESPONSE.FRIEND_REQUEST_SUCCESS
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

const startAcceptedFriendRequest = async (req = request, res = response) => {
    const { id: requestId } = req.params;
    const currentUser = req.user;

    const isValid = isValidObjectId(requestId);

    if (!isValid) {
        return res
            .status(404)
            .json({ ok: false, messages: MESSAGE_ERROR_RESPONSE.ARGUMENT });
    }
    try {
        // Ejecutar ambas consultas de manera simultánea utilizando Promise.all()
        const friendRequest = await FriendRequest.findById(requestId).populate({
            path: 'receiver sender',
            select: 'friends'
        });

        if (!friendRequest) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.ARGUMENT
            });
        }
        if (
            friendRequest.receiver._id.toString() !== currentUser.id.toString()
        ) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.ARGUMENT
            });
        }

        // Cambiar el estado de la solicitud a "accepted"
        friendRequest.status = 'accepted';

        // Agregar los IDs de los usuarios uno al otro en sus arrays "friends"
        friendRequest.receiver.friends.push({
            friend: friendRequest.sender._id,
            friendRequest: friendRequest._id
        });
        friendRequest.sender.friends.push({
            friend: friendRequest.receiver._id,
            friendRequest: friendRequest._id
        });

        // Guardar los cambios en el documento de FriendRequest y los usuarios
        await Promise.all([
            friendRequest.save(),
            friendRequest.receiver.save(),
            friendRequest.sender.save()
        ]);

        return res.status(200).json({
            ok: true,
            messages: MESSAGE_SUCCESS_RESPONSE.FRIEND_ACCEPT_REQUEST_SUCCESS
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};
const startDeleteFriend = async (req = request, res = response) => {
    const currentUser = req.user;
    const { id: requestId } = req.params;
    try {
        const friendRequest = await FriendRequest.findById(requestId).populate({
            path: 'receiver sender',
            select: 'friends'
        });

        if (
            friendRequest.receiver._id.toString() !==
                currentUser.id.toString() &&
            friendRequest.sender._id.toString() !== currentUser.id.toString()
        ) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.ARGUMENT
            });
        }

        // Agregar los IDs de los usuarios uno al otro en sus arrays "friends"
        friendRequest.sender.friends.pull({
            friendRequest: friendRequest._id
        });
        friendRequest.receiver.friends.pull({
            friendRequest: friendRequest._id
        });

        await Promise.all([
            friendRequest.remove(),
            friendRequest.receiver.save(),
            friendRequest.sender.save()
        ]);
        return res.status(200).json({
            ok: true,
            messages: MESSAGE_SUCCESS_RESPONSE.DELETE_FRIEND
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};
const startCancelFriendRequest = async (req = request, res = response) => {
    const { id } = req.params;

    const isValid = isValidObjectId(id);
    if (!isValid) {
        return res
            .status(404)
            .json({ ok: false, messages: MESSAGE_ERROR_RESPONSE.ARGUMENT });
    }
    try {
        const friendRequest = await FriendRequest.findById(id);

        if (!friendRequest) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.ARGUMENT
            });
        }

        // Guarda los cambios
        await friendRequest.remove();

        return res.status(200).json({
            ok: true,
            messages: MESSAGE_SUCCESS_RESPONSE.FRIEND_CANCEL_REQUEST_SUCCESS
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

const startGetSocial = async (req = request, res = response) => {
    const { id } = req.user;
    try {
        const currentUser = await User.findById(id)
            .populate({
                path: 'friends',
                select: 'name username email bio createdAt avatar'
            })
            .populate('friendRequestsReceived friendRequestsSent')

            .lean();

        if (!currentUser) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_FOUND(id)
            });
        }
        const friendsCount = currentUser.friends.length;
        const friendRequestsReceivedCount =
            currentUser.friendRequestsReceived.length;
        const friendRequestsSentCount = currentUser.friendRequestsSent.length;

        return res.status(200).json({
            ok: true,
            data: {
                friendsCount,
                friendRequestsReceivedCount,
                friendRequestsSentCount
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

const startGetFriends = async (req = request, res = response) => {
    const { id } = req.user;
    try {
        const currentUser = await User.findById(id)
            .populate({
                path: 'friends.friend friends.friendRequest',
                select: 'name username email createdAt status bio avatar'
            })
            .lean();
        if (!currentUser) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_FOUND(id)
            });
        }
        return res.status(200).json({
            ok: true,
            data: {
                friends: currentUser.friends
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

const startGetFriendRequestsReceived = async (
    req = request,
    res = response
) => {
    const { id } = req.user;
    try {
        const currentUser = await User.findById(id).populate({
            path: 'friendRequestsReceived',
            match: { status: 'pending' },
            populate: {
                path: 'sender receiver',
                select: 'name username email createdAt bio avatar'
            }
        });

        if (!currentUser) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_FOUND(id)
            });
        }

        return res.status(200).json({
            ok: true,
            data: { friendRequestsReceived: currentUser.friendRequestsReceived }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

const startGetFriendRequestsSent = async (req = request, res = response) => {
    const { id } = req.user;
    try {
        const currentUser = await User.findById(id).populate({
            path: 'friendRequestsSent',
            populate: {
                path: 'sender receiver',
                select: 'name username email createdAt bio avatar'
            }
        });

        if (!currentUser) {
            return res.status(404).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.USER_NOT_FOUND(id)
            });
        }

        return res.status(200).json({
            ok: true,
            data: { friendRequestsSent: currentUser.friendRequestsSent }
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
    startCreateFriendRequest,
    startGetSocial,
    startGetFriendRequestsReceived,
    startGetFriends,
    startGetFriendRequestsSent,
    startCancelFriendRequest,
    startAcceptedFriendRequest,
    startDeleteFriend
};
