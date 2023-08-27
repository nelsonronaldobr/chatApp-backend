import { request, response } from 'express';
import { MESSAGE_ERROR_RESPONSE } from '../interfaces/message.interface.js';

import { User } from '../models/User.model.js';

const startSearchUsers = async (req = request, res = response, next) => {
    const { _search } = req.query;
    const currentUser = req.user;

    if (_search.length === 0) {
        return res.status(200).json({
            ok: true,
            users: []
        });
    }

    try {
        // Realizamos una búsqueda utilizando una consulta OR para buscar por nombre o email
        const users = await User.aggregate([
            {
                $match: {
                    $or: [{ name: { $regex: _search, $options: 'i' } }],
                    _id: { $ne: currentUser._id },
                    'friends.friend': { $not: { $in: [currentUser._id] } }
                }
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                    email: 1,
                    bio: 1,
                    createdAt: 1,
                    avatar: 1
                    // Agrega otros campos que quieras incluir aquí
                }
            }
        ]);

        if (users.length === 0) {
            return res.status(400).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.SEARCH_NOT_FOUND(_search)
            });
        }
        // Consulta para traer las solicitudes de amistad enviadas por el usuario actual
        const currentFriendRequests = await User.findById(currentUser._id)
            .populate('friendRequestsSent friendRequestsReceived')
            .select('status')
            .lean();

        // Recorrer los resultados y agregar la propiedad "sentFriendRequest"
        const usersWithFriendRequests = users.map((user) => {
            const sentFriendRequest =
                currentFriendRequests.friendRequestsSent.find(
                    (request) =>
                        request.receiver.toString() === user._id.toString()
                );

            const receivedFriendRequest =
                currentFriendRequests.friendRequestsReceived.find(
                    (request) =>
                        request.sender.toString() === user._id.toString()
                );

            let friendRequestStatus = null;
            let friendRequestId = null;

            if (sentFriendRequest) {
                friendRequestStatus = 'sent';
                friendRequestId = sentFriendRequest._id;
            } else if (receivedFriendRequest) {
                friendRequestStatus = 'received';
                friendRequestId = receivedFriendRequest._id;
            }

            const friendRequest = {
                exists: friendRequestId !== null,
                id: friendRequestId ? friendRequestId : null,
                friendRequestStatus: friendRequestStatus
                    ? friendRequestStatus
                    : null
            };

            return {
                ...user,
                friendRequest
            };
        });

        return res.status(200).json({
            ok: true,
            users: usersWithFriendRequests
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            messages: MESSAGE_ERROR_RESPONSE.DEFAULT
        });
    }
};

export { startSearchUsers };
