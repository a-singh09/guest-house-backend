const mongoose = require("mongoose");
const Room = require("../room")

const refundSchema = new mongoose.Schema({
  refundId: String,
  spTxnId: String,
  clientTxnId: String,
  refundInitDate: String,
  amount: Number,
  clientCode: String,
  clientId: String,
  message: String,
  responseCode: String

}, { timestamps: true });

const Refund = new mongoose.model("Refund", refundSchema);
module.exports = Refund;