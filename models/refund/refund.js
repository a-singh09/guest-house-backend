const mongoose = require("mongoose");
const Room = require("../room");
const { formatDate } = require("../../utils");

const refundSchema = new mongoose.Schema({
  refundId: String,
  spTxnId: String,
  clientTxnId: String,
  refundInitDate: String,
  amount: Number,
  clientCode: String,
  clientId: String,
  message: String,
  responseCode: String,
  booking: mongoose.Schema.ObjectId,
  name: String,
  bankName: String,
  accountNumber: String,
  IFSC: String,
  refundType: {
    type: String,
    default: 'manual',
    enum: ['automated', 'manual']
  },
  guestHouse: Number,
  arrivalDate: Date,
  cancellationDate: Date,
   noOfDays: Number,
   amountDeducted: Number,
   amountReturned :  Number
  
}, { timestamps: true });





const Refund = new mongoose.model("Refund", refundSchema);
module.exports = Refund;