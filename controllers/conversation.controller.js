import { request, response } from 'express';
import { Conversation } from '../models/Conversation.model.js';
import { Message } from '../models/Message.mode.js';
import { MESSAGE_ERROR_RESPONSE } from '../interfaces/message.interface.js';
import { isValidObjectId } from 'mongoose';

// Para enviar un mensaje
const sendMessage = async ({ senderId, receiverId, content }) => {
    try {
        // Buscar o crear la conversación
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Crear el mensaje
        let message = await Message.create({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content: content
        });

        conversation.messages.push(message._id);

        // Actualizar el último mensaje en la conversación
        conversation.lastMessage = message._id;
        await conversation.save();

        [conversation, message] = await Promise.all([
            Conversation.findById(conversation._id)
                .populate('participants', 'username name email avatar')
                .populate('lastMessage')
                .exec(),
            Message.findById(message._id)
                .populate('sender receiver', 'username name email avatar')
                .exec()
        ]);

        return {
            conversation,
            message
        };
    } catch (error) {
        console.log(error);
        console.error(
            'Error al enviar notificación de inicio de conversación:',
            error
        );
    }
};

// Para enviar un mensaje
const sendStartMessage = async ({ senderId, receiverId }) => {
    try {
        // Buscar o crear la conversación
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Crear el mensaje
        const message = await Message.create({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content: 'Hola 👋'
        });

        // Agregar el mensaje a la conversación
        conversation.messages.push(message._id);

        // Actualizar el último mensaje en la conversación
        conversation.lastMessage = message._id;
        await conversation.save();

        // Cargar las referencias completas de la conversación y el mensaje
        conversation = await Conversation.findById(conversation._id)
            .populate('participants', 'username name email avatar') // O cualquier campo del usuario que quieras mostrar
            .populate('lastMessage') // Si deseas mostrar también el último mensaje
            .exec();

        return conversation;
    } catch (error) {
        console.log(error);
        console.error(
            'Error al enviar notificación de inicio de conversación:',
            error
        );
    }
};

const startGetConversationsLastMessage = async (
    req = request,
    res = response
) => {
    try {
        const userId = req.user.id; // ID del usuario que ha iniciado sesión
        const userConversations = await Conversation.find({
            participants: userId
        })
            .populate('participants', 'username name email avatar')
            .populate({
                path: 'lastMessage',
                populate: [
                    { path: 'sender', select: 'username name email avatar' },
                    { path: 'receiver', select: 'username name email avatar' }
                ]
            })
            .exec();

        // Ordenar las conversaciones por fecha de creación del último mensaje (más reciente primero)
        userConversations.sort(
            (a, b) =>
                new Date(b.lastMessage.createdAt).getTime() -
                new Date(a.lastMessage.createdAt).getTime()
        );

        return res.status(200).json({
            ok: true,
            data: {
                conversations: userConversations
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

const startGetConversationById = async (req = request, res = response) => {
    const { conversationId } = req.params;
    const currentUser = req.user;

    const isValid = isValidObjectId(conversationId);

    if (!isValid) {
        return res
            .status(404)
            .json({ ok: false, messages: MESSAGE_ERROR_RESPONSE.ARGUMENT });
    }

    try {
        const conversation = await Conversation.findById(conversationId)
            .populate(
                'participants',
                'username name email _id createdAt bio avatar'
            )
            .populate({
                path: 'messages',
                populate: [
                    {
                        path: 'sender',
                        select: 'username name email createdAt bio avatar'
                    },
                    {
                        path: 'receiver',
                        select: 'username name email createdAt bio avatar'
                    }
                ]
            })
            .populate({
                path: 'lastMessage',
                populate: [
                    { path: 'sender', select: 'username name email avatar' },
                    { path: 'receiver', select: 'username name email avatar' }
                ]
            })
            .exec();

        if (!conversation) {
            return res.status(404).json({
                ok: false,
                message: 'Conversación no encontrada'
            });
        }

        // Verificar si el usuario actual es uno de los participantes
        const isCurrentUserParticipant = conversation.participants.some(
            (participant) =>
                participant._id.toString() === currentUser._id.toString()
        );

        if (!isCurrentUserParticipant) {
            return res.status(403).json({
                ok: false,
                messages: MESSAGE_ERROR_RESPONSE.AUTHORIZATION
            });
        }

        return res.status(200).json({
            ok: true,
            data: {
                conversation: conversation
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

// Para enviar un mensaje
const startSendStartMessage = async (req = request, res = response) => {
    const { receiverId } = req.body;
    const senderId = req.user._id;
    try {
        // Buscar o crear la conversación
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Crear el mensaje
        const message = await Message.create({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content: 'Hola 👋'
        });

        // Agregar el mensaje a la conversación
        conversation.messages.push(message._id);

        // Actualizar el último mensaje en la conversación
        conversation.lastMessage = message._id;
        await conversation.save();

        // Cargar las referencias completas de la conversación y el mensaje
        conversation = await Conversation.findById(conversation._id)
            .populate('participants', 'username name email avatar') // O cualquier campo del usuario que quieras mostrar
            .populate('lastMessage') // Si deseas mostrar también el último mensaje
            .exec();
        return res.status(200).json({
            ok: true,
            data: {
                conversation
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
    sendMessage,
    sendStartMessage,
    startGetConversationsLastMessage,
    startGetConversationById,
    startSendStartMessage
};
