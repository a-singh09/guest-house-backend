
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = require('./app');
const cronJobForBookingCompletion = require("./bookingScheduler");
const cronJobForPaymentDeadline = require("./paymentDeadlineScheduler");
const { MONGODB_URL } = require("./config/env.config");



//exposing cron job 
cronJobForBookingCompletion();
cronJobForPaymentDeadline();

// connect to database
mongoose.connect(`${MONGODB_URL}`);    
const db = mongoose.connection;
db.once('open', () => {
    console.log("Database connected")
});
db.on("error", (err) => {
    console.log({ database_message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
