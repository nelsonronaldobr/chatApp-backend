import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth/auth.routes.js';
import searchRouter from './routes/search/user.routes.js';
import friendRouter from './routes/friend/friend.routes.js';
import conversationRouter from './routes/conversation/conversation.routes.js';
import userRouter from './routes/user/user.routes.js';
import { getEnvVariables } from './helpers/getEnvVariables.js';
import { connectDB } from './config/connectDB.js';
import { Server } from 'socket.io';
import { Conversation } from './models/Conversation.model.js';
import {
    sendMessage,
    sendStartMessage
} from './controllers/conversation.controller.js';
const app = express();
dotenv.config();

connectDB();

const { PORT, FRONTEND_URL } = getEnvVariables();

const whiteList = [FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Error de Cors'));
        }
    }
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/public', express.static('public'));

/* AUTHENTICATE */
app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/friend', friendRouter);
app.use('/api/conversation', conversationRouter);
app.use('/api/profile/user', userRouter);

const server = app.listen(PORT, () => {
    console.log(`Server Started on Port ${PORT}`);
});

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: FRONTEND_URL,
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('joinRooms', async (userId) => {
        try {
            // Obtener las conversaciones del usuario desde la base de datos
            const userConversations = await Conversation.find({
                participants: userId
            });

            userConversations.forEach((conversation) => {
                socket.join(conversation._id.toString()); // Unirse a la sala de cada conversación
            });
            socket.join(`notifications-${userId}`);
        } catch (error) {
            console.error('Error al unirse a las salas:', error);
        }
    });

    socket.on('sendStartConversation', ({ conversation, receiver }) => {
        try {
            socket.join(conversation._id);

            socket.to(`notifications-${receiver}`).emit('joinConversation', {
                conversationId: conversation._id
            });
            socket
                .to(`notifications-${receiver}`)
                .emit('newConversationNotification', {
                    ...conversation
                });

            socket.to(conversation._id.toString()).emit('newMessage', {
                newMessage: { ...conversation.lastMessage },
                newConversation: { ...conversation }
            });
        } catch (error) {
            console.error(
                'Error al enviar notificación de inicio de conversación:',
                error
            );
        }
    });
    socket.on('sendMessage', async ({ sender, receiver, content }) => {
        try {
            const { message, conversation } = await sendMessage({
                senderId: sender,
                receiverId: receiver,
                content
            });
            socket.to(message.conversation.toString()).emit('newMessage', {
                newMessage: { ...message.toObject() },
                newConversation: { ...conversation.toObject() }
            });
        } catch (error) {
            console.error(
                'Error al enviar notificación de inicio de conversación:',
                error
            );
        }
    });
    socket.on('joinRoom', ({ conversationId }) => {
        socket.join(conversationId);
    });
    socket.on('leaveRooms', () => {
        // Manejar la desconexión del usuario, por ejemplo, dejar la sala
        socket.leaveAll();
    });
});
