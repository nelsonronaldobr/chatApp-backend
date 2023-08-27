import { Schema, model } from 'mongoose';

const messageSchema = new Schema(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation'
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Message = model('Message', messageSchema);
