const {userModel} = require("../models/user.model")
const jwt = require("jsonwebtoken")

async function authMiddleware(req,res,next) {
    const token = req.cookies?.token || req.headers.authorization?.split("")[1];

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing!",
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId);

        req.user = user;

        return next();
    } catch (error) {
        console.error("Error in auth middleware : ", error);
        return res.status(401).json({
            message: "Unauthorized access, token is invalid",
            error: error
        })
    }
}

async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies?.token || req.headers.authorization?.split("")[1];
    
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser");

        if(!user.systemUser){
            return res.status(403).json({
                message: "Fobidden access, not a system user"
            })
        }

        req.user = user

        return next()

    } catch (error) {
        console.error("Error in authSystem middleware : ", error);
        return res.status(401).json({
            message: "Unauthorized access, token is invalid",
            error: error
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}