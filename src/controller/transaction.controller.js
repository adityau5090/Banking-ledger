const { default: mongoose } = require("mongoose");
const { accountModel } = require("../models/account.model");
const { transactionModel } = require("../models/transaction.model");
const { ledgerModel } = require("../models/ledger.model");
const { sendTransactionEmail } = require("../services/nodemailer");

const createTransaction = async (req, res) => {
    
    const { fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if(!fromAccount.trim() || !toAccount.trim() || !amount || !idempotencyKey.trim()){
        return res.status(401).json({
            message: "All fieds are required to create transaction"
        })
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount})
    const toUserAccount = await accountModel.findOne({ _id: toAccount})

    if(!fromUserAccount || !toUserAccount){
        return res.status(401).json({
            message: "Invalid fromAccount or toAccount detail",
        })
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey})

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                data: isTransactionAlreadyExists
            })
        }
        
        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        } 
        
        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(200).json({
                message: "Transaction failed",
            })
        }
        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(200).json({
                message: "Transaction was reversed, please retry",
            })
        }
    }

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(401).json({
            message: "Both sender and reviver account must be active"
        })
    }

    // Derive sender balance from ledger 
    const balance = await fromUserAccount.getBalance()

    if(balance < amount){
        res.status(400).json({
            message: `Insufficient balance! Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    // create Transaction (PENDING)


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
    }, { session })

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: "DEBIT",
    }, { session })
    
    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT",
    }, { session })

    transaction.status = "COMPLTED"
    await transaction.save( { session } )

    await session.commitTransaction()
    session.endSession()

    await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        data: transaction
    })
}

module.exports = { createTransaction }