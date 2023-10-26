const express = require("express");
const router = express.Router();
const User = require("../models/user/user");
const RegApproval = require("../models/regApproval");
const RegisteredUser = require("../models/registeredUsers");
const RejectedUser = require("../models/rejectedUsers");
const Ref = require("../models/user/ref");
const Login = require("../models/login");
const PendingUser = require("../models/pendingUsers");

router.post("/", async (req,res) => {
      const approvalInfo = req.body;
  console.log(approvalInfo);
      const final = {
        user: approvalInfo.user,
        status: approvalInfo.status,
      }



      try {
        const approval = new RegApproval(final);
        const newApproval = await approval.save();
        
        if(newApproval === null) {
            throw new Error("approval info not added");
        }

        const x = await User.find({_id: newApproval.user});
        if(x.length === 0){
          throw new Error({message: `user with id ${newApproval.user} not found in the database` });
        }
        console.log({message: `new approval: ${newApproval._id} created successfully`});

        // delete user from pending user
        await PendingUser.deleteOne({user: newApproval.user});
       
        if(newApproval.status === "accept") {
          console.log("this is accepted status");
            const x  = new RegisteredUser({
              user: newApproval.user,
            });
            const registeredUser = await x.save();


            if(registeredUser.length === 0) {
                throw new Error("registered user not added");
            }

             const uuuser = await User.find({_id: registeredUser.user})

            if(uuuser.length === 0) {
              throw new Error("User not found");
            }
            

            const login_data = 
              {
                email: `${uuuser[0].email}`,
                password: `${uuuser[0].password}`,
                isAdmin: false
               }
            
           const userLogin = new Login(login_data);
          

            const newLogin = await userLogin.save();
            if(newLogin.length === 0) {
              throw new Error("new Login not added");
            }

            

            // add registered User to the his reference
          //  const ref = await Ref.update({_id: registeredUser.reference}, {$push: {refFrom: registeredUser._id}});

        //    if(ref === null) {
        //    throw new Error("ref not added");
        // }
        }

        
        else if(newApproval.status === "reject") {
          console.log('this is rejected status');
            const user = new RejectedUser({
              user: newApproval.user
            });
            const rejectedUser = await user.save();
            if(rejectedUser === null) {
              throw new Error("rejected user could not be added");
            }



             const deleted_user = await User.deleteOne({_id: newApproval.user});
             if(deleted_user!== null) {
              console.log("User deleted successfully");
                // res.status(200).json({message: "User deleted successfully"});
             }
             else {
              console.log("user could not be deleted");
              // res.json({message: "user could not be deleted.."});
             }
        }


      }

      catch(err) {
console.log({message: err.message});
      }


})

module.exports = router;