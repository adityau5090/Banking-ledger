const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating an account!"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
        unique: [true, "Email already exist"],
    },
    name: {
        type: String,
        required: [true, "Name is required for creating an account"],
    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "Password should be contain more than 6 characters"],
        select: false,
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return;
    }

    const hash = await bcrypt.hash(this.password, 10); 
    this.password = hash;

    return; 
})

userSchema.methods.comparePassword = async function (password){
    // console.log(password, this.password)
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("user", userSchema)
module.exports = { userModel };
