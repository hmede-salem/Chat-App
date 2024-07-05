const { model, Schema, default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config")

const userSchema = new Schema({
    firstName: {
        type: String,
        minlength: 2,
        required: true,
    },
    lastName: {
        type: String,
        minlength: 2,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlenght: 8,
        required: true,
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
});

userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id },
        config.get("jwtPrivateKey")
    );
};

const User = model("User", userSchema);

module.exports = User;