const express = require("express");

const router = express.Router();

const Booking = require("../../models/booking/booking");
const Refund = require("../../models/refund/refund");
const Transaction = require("../../models/transaction");
const { CLIENT_CODE, STAGING_REFUND_URL } = require("../../config/env.config");
const { encrypt, formatDate } = require("../../utils");
const axios = require("axios");

function calcNoOfDays(latter, earlier) {
    const latterTime = latter.getTime();
    const earlierTime = earlier.getTime();
return (latterTime - earlierTime) / (1000 * 60 * 60 * 24);

}
router.post("/", async (req, res) => {
    const data = req.body;
console.log("Data: ", data);
    // info regarding refund
    const actualData = {
        booking: data.booking,
        name: data.name,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        IFSC: data.IFSC,
    };



  
    try {
        // save new refund
        // const refundDetails = await newRefund.save();
        // console.log(refundDetails);

        // update booking status
        const bookingDetails = await Booking.findByIdAndUpdate(
            data.booking,
            { status: "refundInitiated" }
        );


        const { guestHouseAllotted, startDate, endDate, roomsAllotted } = bookingDetails;


        const currentDate = new Date();
    
        const arrivalDate = new Date(startDate);
        const departureDate = new Date(endDate);
        const noOfRooms = roomsAllotted.length;
        const subAmount = guestHouseAllotted === 1 ? 1000 : 600;
        const amount = subAmount * noOfRooms;
        let amountDeducted = 0;
        const arrivalDaysLeft = calcNoOfDays(arrivalDate - currentDate);

        if(arrivalDaysLeft >= 3 && arrivalDaysLeft <= 7)  {
            amountDeducted = 0.25 * amount;
        }
        else if (arrivalDaysLeft >= 1 && arrivalDaysLeft < 3) {
            amountDeducted = 0.5 * amount;
        }
        else if(arrivalDaysLeft >=0 && arrivalDaysLeft<1) {
            amountDeducted = amount;
        }
        
                

        const newRefund = new Refund({
            ...actualData,
            guestHouse: guestHouseAllotted,
            arrivalDate: (arrivalDate),
            cancellationDate: (currentDate),
             noOfDays: calcNoOfDays(departureDate, arrivalDate),
             amountDeducted,
             amountReturned :  (amount - amountDeducted)  
         });

         await newRefund.save();
         
         console.log(newRefund);

        res.status(200).json({
            ...actualData,
            guestHouse: guestHouseAllotted,
            arrivalDate: formatDate(arrivalDate),
            cancellationDate: formatDate(currentDate),
             noOfDays: calcNoOfDays(departureDate, arrivalDate),
             amountDeducted,
             amountReturned :  (amount - amountDeducted)  
         });


    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}
);


router.get("/initiateRefund", async (req,res)=> {
const {clientTxnId, message} = req.query;

if(!clientTxnId || !message) {
    return res.status(400).message({message: "client Txn id or message not found"});
}
try {
    
    const existingTransaction = await Transaction.findOne({clientTxnId});

    if(!existingTransaction) {
        return res.status(404).json({message: "Transaction not found"})
    }

    const {amount,  sabpaisaTxnId } = existingTransaction;
const stringforRequest = `clientCode=${CLIENT_CODE}&amount=${amount}&spTxnId=${sabpaisaTxnId}&clientTxnId=${clientTxnId}&message=${message}`;

const encryptedStringForRequest = encrypt(stringforRequest);
console.log(encryptedStringForRequest);

const response = await axios.get(`${STAGING_REFUND_URL}?clientCode=${CLIENT_CODE}&refundQuery=${encryptedStringForRequest}`);

const data = response.data;

await Refund.create({...data, refundType: "automatic" });
console.log(data);

res.status(201).json(data)
} catch (error) {

    console.log(error);
    res.status(500).json({message: "could not perform refund. Check server logs for more details"})
}

});

router.get("/:clientTxnId",  async (req,res) => {
    const clientTxnId = req.params.clientTxnId;

    if(!clientTxnId) {
        return res.status(404).json({message:"Booking ID not found"});
    }

    try {

        // const refundBookingDetails = await Refund.findOne({booking: bookingId}).populate('booking');
        const refundBookingDetails = await Refund.findOne({clientTxnId});
        if(!refundBookingDetails) {
         return res.status(404).json({message: "Booking has not been refunded yet..."});
        }

      return res.status(200).json(refundBookingDetails);
        
        
    } catch (error) {
        console.log("Error in GET /refund/:id route: ", error.message);
       return  res.status(500).json({message: "Could not fetch refund details"});
    }


})
router.get("/", async (req, res) => {
    try {
        const refunds = await Refund.find({});
        res.json(refunds);
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router;