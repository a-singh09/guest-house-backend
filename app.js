
const express = require("express");
const cors = require('cors');
const session = require("express-session")
const MongoStore = require('connect-mongo');
const url = require('url');
const app = express();


//configuring routes 
const registerRoute = require("./routes/userRegistration");
const approveRegistrationRoute = require("./routes/approveRegistration");
const usersRoute = require("./routes/users");
const loginRoute = require("./routes/login");
const referenceRoutes = require("./routes/references");
const emailRoute = require("./routes/email")
const bookingRoute = require("./routes/booking/booking");
const bookingApprovalRoute = require("./routes/booking/bookingApproval");
const guestHouseRoute = require("./routes/guestHouse")
const refundRoute = require("./routes/refund/refund");
const paymentRoute = require("./routes/payment/payment");
const { JWT_SECRET, FRONTEND_URL } = require("./config/env.config");
const { decrypt, formatDate } = require("./utils");
const Transaction = require("./models/transaction");
const Booking = require("./models/booking/booking");


app.enable('trust proxy');
// const origins = ['http://localhost:5173',"https://guest-house-system-eight.vercel.app/"];
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname));

app.use(cors({
    origin: ["http://localhost:5173", "https://guest-house-frontend.onrender.com"],
    // default: "http://localhost:5173",
    credentials: true,
}));
//body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: JWT_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb+srv://user:user@cluster0.uunf6ts.mongodb.net/guestHouse?retryWrites=true&w=majority" }),
    cookie: {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
    }
}));

app.get("/", (req, res) => {
    res.send("Hello World");
})

// for session checking
app.get('/check-session', (req, res) => {
    // console.log(req.session);
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user, isAdmin: req.session.isAdmin });
        console.log("loggedIn is true");
    } else {
        res.send({ loggedIn: false });
        console.log("loggedIn is false");
    }
});

// for logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send({ message: 'Error logging out' });
        } else {
            res.send({ message: 'Logged out successfully' });
        }
    });
});


app.post("/getPgRes", async (req, res) => {

    try {
        
        console.log(req.body);
    const data = req.body;
    const encResponse = data.encResponse;
   let decryptedResponse = decrypt(encResponse);

   let result = {};
   decryptedResponse.split("&").forEach((item) => {

    let [key, value] = item.split("=");
    result = {
        ...result,
        [key]: value
    }
   });

   let { transDate, clientTxnId, bankName, statusCode, status, paidAmount, paymentMode, sabpaisaTxnId, sabpaisaMessage,  bankErrorCode } = result;


  const existingTransaction =  await Transaction.findOne({clientTxnId});
  const bookingId = existingTransaction.bookingId;

  if(!existingTransaction) {
    return res.status(404).json({message: "Transaction not found in the database"})
  }


  await Transaction.updateOne({
    clientTxnId,
  }, {
   
      bankName,
      statusCode,
      status,
      paidAmount,
     paymentMode,
     sabpaisaMessage,
     sabpaisaTxnId,
     bankErrorCode
  });


  console.log(result);

  const existingBooking = await Booking.findById(bookingId);
  console.log(existingBooking);
  if(status !== "FAILED") {
      existingBooking.status = `PAYMENT ${status}`;
  }

  await existingBooking.save();
      res.redirect(`${FRONTEND_URL}/login`);

    } catch (error) {

        console.log("Payment gateway response error: ", error);
        res.status(500).json({message: "Error in getting payment gateway response..."});
    }
    
  
  });


 

  
  

//listening on port 3000
app.use("/register", registerRoute);
app.use("/admin/approveRegistration", approveRegistrationRoute);
app.use("/users", usersRoute);
app.use("/login", loginRoute);
app.use("/references", referenceRoutes);
app.use("/email", emailRoute);
//booking routes
app.use("/booking", bookingRoute);
app.use("/admin/bookingApproval", bookingApprovalRoute);
app.use("/guestHouse", guestHouseRoute);
app.use("/refund", refundRoute);
app.use("/payments", paymentRoute);

// app.use("/check-session", sessionRoute);

app.use("/images", require("./routes/images"));
app.use("/calendar", require("./routes/calendar"));

module.exports = app;
