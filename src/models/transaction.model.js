const mongoose = require("mongoose")

const transactionSchema = mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",  
        required: [true, "Transiction must be associated with a from account"],
        index: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",  
        required: [true, "Transiction must be associated with a to account"],
        index: true,
    },
    status: {
        type: String,
        enum : {
            values: ["PENDING","COMPLETED","FAILED","REVERSED"],
            message: "Status can be either PENDING,COMPLETED,FAILED or REVERSED",
        },
        default: "PENDING",
    },
    amount: {
        type: Number,
        required: [true, "Amount is requred fro creating a transaction"],
        min: [1,"Transaction can not be zero or negtive"],
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotenct Key is required for creating a transaction"],
        index: true,
        unique: true,
    }
}, {
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = { transactionModel }