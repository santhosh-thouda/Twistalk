import mongoose from "mongoose";

const ConversationSchema = mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        }],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Messages"
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: new Map()
        },
        isGroupChat: {
            type: Boolean,
            default: false
        },
        groupName: {
            type: String,
            default: ""
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const ConversationModel = mongoose.model("Conversations", ConversationSchema);
export default ConversationModel; 