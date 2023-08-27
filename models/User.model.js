import { model, Schema } from 'mongoose';

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        bio: {
            type: String,
            default: 'Hola! Soy nuevo en chat-app, enviame una solicitud!'
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        avatar: {
            type: String,
            default: 'https://chat-app-qvaw.onrender.com/public/default.png'
        },
        conversations: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Conversation'
            }
        ],
        friendRequestsSent: [
            {
                type: Schema.Types.ObjectId,
                ref: 'FriendRequest'
            }
        ],
        friendRequestsReceived: [
            {
                type: Schema.Types.ObjectId,
                ref: 'FriendRequest'
            }
        ],
        friends: [
            {
                friend: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                friendRequest: {
                    type: Schema.Types.ObjectId,
                    ref: 'FriendRequest'
                }
            }
        ],
        canReceiveFriendRequests: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const User = model('User', userSchema);
