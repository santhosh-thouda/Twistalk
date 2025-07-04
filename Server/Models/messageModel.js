import mongoose from "mongoose";

const MessageSchema = mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },
        text: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        file: {
            type: String,
            default: ""
        },
        messageType: {
            type: String,
            enum: ["text", "image", "file", "emoji"],
            default: "text"
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent"
        },
        reactions: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users"
            },
            emoji: {
                type: String,
                required: true
            }
        }],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Messages"
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const MessageModel = mongoose.model("Messages", MessageSchema);
export default MessageModel; 