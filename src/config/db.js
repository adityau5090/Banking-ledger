const mongoose = require("mongoose")

const connectDB = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("server is connected to db");
    }).catch(err => {
        console.log("Error connecting to DB :", err);
        process.exit(1);
    })
}

module.exports = { connectDB }
