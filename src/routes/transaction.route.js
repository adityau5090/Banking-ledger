const express = require("express");
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware");
const { createTransaction, createInitialFundTransaction } = require("../controller/transaction.controller");

const router = express.Router();

router.post("/", authMiddleware, createTransaction)
router.post("/system/initial-fund", authSystemUserMiddleware, createInitialFundTransaction)

module.exports = router;