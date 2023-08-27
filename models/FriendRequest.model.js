import { Schema, model } from 'mongoose';
import { User } from './User.model.js';

const friendRequestSchema = new Schema(
    {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que envía la solicitud
        receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que recibe la solicitud
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

friendRequestSchema.pre('remove', async function (next) {
    const friendRequest = this;
    try {
        // Encontrar el usuario que envió la solicitud
        // Encontrar el usuario que recibió la solicitud

        const [senderUser, receiverUser] = await Promise.all([
            User.findById(friendRequest.sender),
            User.findById(friendRequest.receiver)
        ]);

        // Eliminar las referencias a la solicitud de amistad de los usuarios
        senderUser.friendRequestsSent.pull(friendRequest._id);
        receiverUser.friendRequestsReceived.pull(friendRequest._id);

        // Guardar los cambios en los usuarios
        await Promise.all([senderUser.save(), receiverUser.save()]);

        next();
    } catch (error) {
        next(error);
    }
});

export const FriendRequest = model('FriendRequest', friendRequestSchema);
