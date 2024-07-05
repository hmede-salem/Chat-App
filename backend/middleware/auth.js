const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
    const token = req.body.token;
    if (!token) return res.status(401).send("Access denied, No token provided.");
    console.log(token);
    try {
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
        if (!decoded) return res.status(400).send("Invalid token.");
        console.log(decoded);
        // req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send("Invalid token.");
    }
};