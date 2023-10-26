const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    dept: {
        type: String,
        required:true,
    },
    phone: {
        type: String,
        required: true,
    }
})

const Faculty = new mongoose.model("Faculty", facultySchema);

module.exports = Faculty;