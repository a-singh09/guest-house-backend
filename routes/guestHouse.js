const express = require('express');
const router = express.Router();

const guestHouse = require('../models/guestHouse');


router.post('/', async (req,res) => {
    // create all guestHouses
    try {
        const guestHouse1 = new guestHouse({guestHouseId: 1});
        await guestHouse1.save();

        const guestHouse2 = new guestHouse({guestHouseId: 2});
        await guestHouse2.save();

        const guestHouse3 = new guestHouse({guestHouseId: 3});
        await guestHouse3.save();


        res.json({message: "guest houses created successfully"});
    }
    catch(err) {
        console.log({message: err.message});
        res.status(500).json({message: err.message});
    }
})


router.delete("/", async (req,res) => {
    try {
         await guestHouse.deleteMany({});

         res.json({message: "Guesthouses deleted successfully..."})
    }
    catch(err) {
        console.log({message: err.message});
        res.json({message: err.message});
    }
})

//GET info regarding the guest houses 
router.get("/", async (req, res) => {
    try{
      const guestHouseDetails = await guestHouse.find({});
      res.status(200).json(guestHouseDetails);
    }
    catch(err) {
          console.log({message: err.message});
            res.status(500).json({message: err.message});
    }
})


//Get guesthouse by id 
router.get("/:id", async (req,res) => {
    const id = req.params.id;
    try {
      const guestHouseDetails = await guestHouse.find({guestHouseId: id});

      res.status(200).json(guestHouseDetails)
    }
    catch(err) {
        console.log({message: err.message});
        res.status(500).json({message: err.message});
  }
});


// update guesthouse and room details 
router.put("/room/allot", async (req,res) => {
    const data = req.body;
    try {
        //integer
          const guestHouseId = data.guestHouseAllotted;
          // array 
          const rooms = data.roomsAllotted;


          const incObject = {}; 
        for(let i = 0;i<=rooms.length;i++) {
            incObject[`rooms.${rooms[i]-1}`] = true;
        }
        await guestHouse.updateOne({
            guestHouseId: guestHouseId
      }, {
       $set:  incObject
      });

    }
    catch(err) {
console.log({message: err.message});
res.json({message: err.mesage});
    }
})

module.exports = router;