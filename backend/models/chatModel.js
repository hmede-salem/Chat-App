const { model, Schema, default: mongoose } = require("mongoose");

const messageSchema = new Schema({
    sender: {
        // type: String
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiver: {
        // type: String
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
    },
}, {
    timestamps: true,
});
const Message = model("Message", messageSchema);

const chatRoomSchema = new Schema({
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, ],
        messages: [messageSchema],
    }
    // , {
    // timestamps: true
    // }
);

const ChatRoom = model("Chat", chatRoomSchema);

// module.exports = ChatRoom;
exports.Message = Message;
exports.ChatRoom = ChatRoom;