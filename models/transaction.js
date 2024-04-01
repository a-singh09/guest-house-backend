const {Schema, model} = require('mongoose');

const transactionSchema  = new Schema({

    bookingId: {
type: Schema.Types.ObjectId
    },
payerEmail: {
    required: true,
    type: String
},
payerName: {
    type: String,
    required: true
},
payerMobile : {
    type: String,
    required: true
},
clientTxnId: {
        type: String,
    required: true
},
amount: {
    type: Number,
    required: true
},

spTxnId: {
    type: String
},
channelId: {
    type: String,
    required: true
},
mcc: {
    type: String,
    required: true
},
transDate: {
    type: String,
    required: true
},
status: {
    type: String,
}, 
sabpaisaTxnId: {
    type: String,
},
sabpaisaMessage: {
    type:String,
},
paidAmount: {
    type: Number,
},
paymentMode: {
type: String
}, 

bankName: {
    type: String
},

statusCode: {
    type: Number
},

bankErrorCode: {
    type: String
}

}, {
    timestamps: true
});

const Transaction = model('Transaction',transactionSchema );
module.exports = Transaction;
