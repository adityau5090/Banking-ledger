const { userModel } = require("../models/user.model")
const jwt = require("jsonwebtoken")
const {sendRegistrationEmail} = require("../services/nodemailer")

const registerController = async (req,res) => {
    try {
        const { email, password, name } = req.body;

    const isExists = await userModel.findOne({email});

    if(isExists){
        return res.status(422).json({
            message: "User already exist with this Email",
            status: "failed"
        })
    }
    const user = await userModel.create({
        email,
        password,
        name
    })

    // console.log("User created : ", user);

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })

    res.cookie("token", token);

    res.status(201).json({
        data: user,
        message: "User created successfully",
        token,
    })

    await sendRegistrationEmail(user.email, user.name);

    } catch (error) {
        console.error("error in registering : ",error);
        return res.status(401).json({
            message: "Error while resitering user",
            error: error?.message || "something went wrong"
        })
    }
}

const loginController = async (req,res) => {
    try {
        const { email,password } = req.body;

    const user = await userModel.findOne({email}).select("+password");
    if(!user){
        return res.status(501).json({
            message: "User does not exist with this email"
        })
    }

    const checkPassword = await user.comparePassword(password);

    if(!checkPassword){
        return res.status(501).json({
            message: "Unauthorized access"
        })
    }
    
    const token =  jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    res.cookie("token", token);

    res.status(201).json({
        message: "User loggin successfully",
        data: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token
    })
    } catch (error) {
        console.error("error in login : ",error);
        return res.status(401).json({
            message: "Error while login user",
            error: error?.message || "something went wrong"
        })
    }

}

module.exports = { 
    registerController,
    loginController
}