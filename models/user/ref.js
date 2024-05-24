const mongoose = require("mongoose");
const User  = require("./user");
const Student = require("./student");
const Alumni = require('./alumni');
const Other = require("./other");
const Faculty = require("./faculty");

const refSchema  = new mongoose.Schema({
    // _id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //      required: true,
    //      unique: true,
    // },
      refTo : {
        type:  mongoose.Schema.Types.ObjectId,
        required: false,
        refPath: 'refType'
    },
        refType : {
            type: String,
            required: false,
            enum: ['student', 'alumni','other','faculty'],
        }, 
       
        refFrom : {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default : [],
        }
}, { timestamps: true });

const Ref = new mongoose.model("Reference", refSchema);

module.exports = Ref;