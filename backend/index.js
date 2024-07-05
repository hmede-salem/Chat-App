const express = require("express");
const app = express();
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const config = require("config");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const bcrypt = require("bcrypt");
const User = require("./models/userModel");
const { ChatRoom, Message } = require("./models/chatModel");
const cors = require("cors");
const { send, emit } = require("process");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {},
});
const PORT = 5001;

app.use(express.json());
app.use(cors());
app.post("/getMessage", auth, async(req, res) => {
    const { myId, email } = req.body;
    try {
        const contact = await User.findOne({ email });
        const me = await User.findById({ _id: myId });
        let chatRoom = await ChatRoom.findOne({
            users: {
                $all: [me._id, contact._id],
            },
        }).populate({ path: "messages", populate: { path: "sender receiver" } });
        if (chatRoom !== null) {
            messages = chatRoom.messages;
            res.send({ messages });
        } else {
            res.status(404).send({ succes: false, msg: "There's no messages." });
        }
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});
app.post("/sendMessage", async(req, res) => {
    const { myId, email, message } = req.body;
    try {
        const receiver = await User.findOne({ email });
        const sender = await User.findById({ _id: myId });
        let chatExist = await ChatRoom.findOne({
            users: {
                $all: [sender._id, receiver._id],
            },
        });
        if (!chatExist) {
            let newMessage = new Message({
                sender: sender._id,
                receiver: receiver._id,
                message: message,
            });
            let chat = new ChatRoom({
                users: [sender._id, receiver._id],
                messages: newMessage,
            });
            chat = await chat.save();
            return res.send({
                success: true,
                msg: "The message was sent to the receiver.",
            });
        } else {
            let newMessage = new Message({
                sender: sender._id,
                receiver: receiver._id,
                message: message,
            });
            chatExist.messages.push(newMessage);
            await chatExist.save();
            return res.send({
                success: true,
                msg: "The message was sent to the receiver.",
            });
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.post("/login", async(req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).send({
                    success: false,
                    msg: "Invalid email or password.",
                });
            } else {
                const validPassword = await bcrypt.compare(password, user.password);
                if (validPassword) {
                    const token = user.generateAuthToken();
                    // learn how to use jwt, return as token
                    return res.status(200).send({
                        success: true,
                        token: token,
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        msg: "loggedin",
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        msg: "Invalid email or password.",
                    });
                }
            }
        } catch (err) {
            console.log(err);
            res.status(500).send(err.message);
        }
    }
});

app.post("/contacts", async(req, res) => {
    const id = req.body.id;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).send({
            success: false,
            msg: "User not found!",
        });
    } else {
        const { contacts } = await user.populate(
            "contacts",
            "firstName lastName email"
        );
        res.send(contacts);
    }
});

app.post("/register", async(req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { firstName, lastName, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).send({
                success: false,
                msg: "User already registered.",
            });
        } else {
            user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
            });
            // jwt -> return as token
            user.password = await bcrypt.hash(password, 10);
            user = await user.save();
            console.log(user);

            res.send(user);
        }
    } catch (err) {
        console.log(err.message);
    }
});

app.post("/add", async(req, res) => {
    try {
        const { email, myId } = req.body;
        const { error } = validateEmail(email);
        if (error) return res.status(400).send(error.details[0].message);

        const me = await User.findById(myId).populate("contacts");
        let user = await User.findOne({ email });
        let ok = true;
        if (me.contacts) {
            me.contacts.forEach((c) => {
                if (c.email === user.email) {
                    ok = false;
                }
            });
        }

        if (!user) {
            return res.status(404).send({
                success: false,
                msg: "User not found.",
            });
        } else if (user.email === me.email) {
            console.log("same");
            return res.status(400).send({
                success: false,
                msg: "Not allowed",
            });
        } else if (!ok) {
            return res.status(400).send({ success: false, msg: "Already added." });
        } else {
            console.log(me, user._id);

            me.contacts.push(user._id);
            await me.save();

            return res.send({
                success: true,
                msg: "User added successfully.",
            });
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

const validateUser = function(user) {
    const schema = Joi.object({
        firstName: Joi.string().min(2),
        lastName: Joi.string().min(2),
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    });
    return schema.validate(user);
};

const validateEmail = function(email) {
    const schema = Joi.object({
        email: Joi.string().required().email(),
    });
    return schema.validate({ email });
};

io.on("connection", (socket) => {
    socket.on("sending-message", (data) => {
        socket.broadcast.emit("sending-message", data);
    });
});

http.listen(PORT, () => {
    mongoose
        .connect("mongodb://localhost/chat")
        .then(() => console.log("Connected to MongoDB..."))
        .catch((err) => console.log(err.message));

    console.log(`Listening to PORT ${PORT}..`);
});