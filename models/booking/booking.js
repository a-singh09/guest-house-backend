const mongoose  = require("mongoose");
const Room = require("../room")

const bookingSchema = new mongoose.Schema({
    
    kind :{
     type:String,
    //  required: true,
     enum:["official", "unofficial"]
    }, 

    purpose: {
        type: String,
         required: true,
        },

     name: {
        type: String,
        required: true,
    },

    designation: {
          type: String,
          required :true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
        type:String,
// max: [9999999999, "Phone no. must be 10 digit"],
// min: [1000000000, "Phone no. must be 10 digit"], 
        required: true,
    },
    email: {
        type:String, 
        required: true,
    },

    companions: {
        type: [String],
    },

    startDate: {
        type: Date,
        // required: true,
    },

    startTime: {
         type: String,
        //  required: true,
    },

    endDate: {
        type: Date,
        // required: true,
    },

    endTime: {
        type: String, 
        // required: true,
    },

    status: {
        type: String,
        required: true,
        // enum: ['approved', 'pending','hodPending', 'cancelled', 'rejected', 'checkedOut', 'refunded', 'autoReject'],
        // default: 'pending'
    },

    paymentStatus: {
        type: String,
        default: "UNPAID"
    },

    clientTxnId: {
      type: String
    },

    bookingFor: {
         type: String,
    },


   guestHouseSelected :{
        type: Number
   },

   roomsSelected :{
         type: Number
   },

   roomsAllotted: {
           type: [Number],
           default : []
   },
  
   guestHouseAllotted: {
          type: Number
   },
 
    roomBooker: {
        isAdmin : {
          type: Boolean, 
          default: false,
        },
        isStudent : {
           type: Boolean
        },

        isFaculty: {
           type: Boolean,
           default: false
        },
        idProof: {
            type: String
        },
        name: {
            type: String,
            //  required: true
        },
        designation:{
            type: String, 
            // required: true
        },
        dept: {
            type: String,
            // required: true
        },
        phone: {
            type:String,
            // max: [9999999999, "Phone no. must be 10 digit"],
            // min: [1000000000, "Phone no. must be 10 digit"], 
            // required: true
        },
        email: {
            type: String,
            required: true
        },
        address: {
            type: String,
            //  required: true,
        },
        
    }
}, { timestamps: true });

const Booking = new mongoose.model("Booking", bookingSchema);
module.exports = Booking;