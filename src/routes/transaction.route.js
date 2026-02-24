const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { createTransaction } = require("../controller/transaction.controller");

const router = express.Router();

router.post("/", authMiddleware, createTransaction)

module.exports = router;