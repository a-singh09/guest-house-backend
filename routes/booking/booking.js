const mongoose = require('mongoose');
const express = require("express");
const axios = require("axios")


const router = express.Router();
const Booking = require("../../models/booking/booking");
const RegisteredUser = require('../../models/registeredUsers');
const guestHouse = require('../../models/guestHouse');
const Login = require('../../models/login');



router.use("/register", require("./bookingForm"));


// GET all the booking
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find({});

    res.status(200).json(bookings);
  }
  catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message })
  }
});


router.get("/admin/:id", async (req,res) => {

  const id = req.params.id;
  if(!id) {
    return res.status(400).json({message: "ID Parameter not found"});
  }

  try {

    const existingLogin = await Login.findById(id);
    if(!existingLogin) {
      res.status(404).json({message: "Login user not found"});
    }

    const email = existingLogin.email;
    const adminBookings = await Booking.find({"roomBooker.isAdmin" : true, "roomBooker.email": email });
    return res.json(adminBookings);
    
  } catch (error) {
    console.log("GET /booking/admin/:id error: ", error.message);
    return res.json({message:"Error in fetching admin's booking history"});
  }
});


// GET bookings by ID 
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const booking = await Booking.find({ _id: id });

    res.status(200).json(booking);

  }
  catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message })
  }
});


// GET pending or registered or rejected booking 
router.get('/approved/:approvalType', async (req, res) => {
  const approvalType = req.params.approvalType;

  const possibleBookingOptions = ['pending', 'approved', "cancelled", "rejected", "upcoming", "past"];
  try {
    if (approvalType === 'pending' || approvalType === 'approved' || approvalType === 'cancelled' || approvalType === 'rejected' || approvalType === 'upcoming' || approvalType === 'past') {
      if (approvalType === 'approved') {
        if (req.query) {
          const { guestHouse } = req.query;
          const bookings = await Booking.find({
            status: "approved",
            guestHouseSelected: guestHouse
          }, { startDate: 1, endDate: 1, name: 1, email: 1, roomsAllotted: 1 });

          const finalBooking = [];
          bookings.forEach((booking) => {
            for (let roomId of booking.roomsAllotted) {
              let newBooking = {
                checkInDate: booking.startDate,
                checkOutDate: booking.endDate,
                name: booking.name,
                email: booking.email,
                roomId
              }

              finalBooking.push(newBooking);
            }

          })

          return res.status(200).json(finalBooking);

        }

      }

      else if (approvalType === 'upcoming') {
        const bookings = await Booking.find({ status: 'approved', startDate: { $gte: new Date() } });
        res.status(200).json(bookings);
      }

      else if (approvalType === 'past') {
        const bookings = await Booking.find({ status: 'checkedOut', endDate: { $lt: new Date() } });
        res.status(200).json(bookings);
      }

      else {
        const booking = await Booking.find({ status: approvalType });
        res.status(200).json(booking);
      }
    }
    else {
      throw new Error("arrival type not allowed");
    }
  }
  catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message })
  }
});


router.patch("/:id", async (req,res) => {
  const id = req.params.id;

  try {
    const existingBooking = await Booking.findById(id);
    if(!existingBooking) {
     return  res.status(404).json({message:"Booking not found"});
    }

    existingBooking.status = "paid";
    await existingBooking.save();

   return res.status(200).json({message: "Booking paid successfully..."})


  } catch (error) {
    console.log("/booking/:id PATCH Error: ", error.message);
    return res.status(500).json({message: "Failed to update status"});
  }
});


// DELETE FOR (BOOKING CANCELLATION): delete the booking and remove from booking history
// Changing status to cancelled
router.post("/:id", async (req, res) => {
  const id = req.params.id;
  try {

    // booking cancelled
    const y = await Booking.findByIdAndUpdate(id, {
      status: 'cancelled'
    }, {
      new: true
    });


    // make booking status cancelled

    console.log(y);
    // update the info in guesthouse collection



    if (y.roomsAllotted.length > 0) {
      const rooms = y.roomsAllotted;
      const guestHouses = y.guestHouseAllotted;

      for (let i = 0; i < rooms.length; i++) {
        const incObject = {};
        incObject[`rooms.${rooms[i] - 1}`] = false;
        await guestHouse.updateOne({
          guestHouseId: guestHouses
        }, {
          $set: incObject
        });
      }
    }




    // update the Registered user's booking history if booking cancelled
    // if(!y.roomBooker.isAdmin) {
    //   const registeredUsers = await RegisteredUser.find({}).populate('user');
    //   const user =   registeredUsers.filter((user) => user.user.email === y.roomBooker.email);


    //   await RegisteredUser.updateOne(
    //     {_id: user[0]._id}, {
    //       $pull: {
    //         bookingHistory: id,
    //       },
    //     });
    //   }



    res.json({ message: "Booking Cancelled Successfully..." });


  }

  catch (err) {
    console.log({ message: err.message });
    res.status(500).json({ message: err.message })
  }
});



router.delete("/", async (req, res) => {
  try {
    await Booking.deleteMany({});

    res.json({ message: "All Bookings deleted Successfully" })
  }
  catch (err) {
    res.json({ message: err.message })
  }
})

module.exports = router;
