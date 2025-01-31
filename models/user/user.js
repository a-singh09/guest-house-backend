const mongoose = require('mongoose');
const Ref = require('./ref');
const Image = require('../Image');


const userSchema = new mongoose.Schema({
  
name: {
    type: String,
    required: true,
},
phone: {
type:String,
// max: [9999999999, "Phone no. must be 10 digit"],
// min: [1000000000, "Phone no. must be 10 digit"], 
required: false,
},
email: {
    type: String,
    required: true,
    unique: true,
},
city: {
    type: String,
    // required:true,
},
address: {
    type: String,
required: false,
},
govtID: {
    type: String, 
    // required: true,
},
userLogo: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Image',
},
idProof: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Image',
},

refInfo: {
    type: String,
},
reference: {
  type: mongoose.Schema.Types.ObjectId,
  ref:'Reference',
}
,
password: {
    type: String,
    required: true,
},

verificationToken: {
    type: String,
    required :true,
},
emailVerified: {
    type: Boolean,
    required: true,
    default: false,
},
registerOption: {
   type:  Number,
   required: true,
}, 
nitUserDept: {
    type: String
}, 
isNitUser : {
    type: Boolean
},
studRoll: Number,

}, { timestamps: true });

const User = new mongoose.model("User", userSchema);
module.exports = User;


