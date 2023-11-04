const express = require("express");
const nodemailer = require("nodemailer");

const User = require("../models/user/user");
const bookingEmailRoute = require('./booking/bookingEmail');

const router  = express.Router();

//##### all the booking email notification will be handled here....
router.use("/booking", bookingEmailRoute);


const transportOptions = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "mrimann96@gmail.com",
        pass: "lwidtbnghfrtcgcv",
    }
}


const transporter = nodemailer.createTransport(transportOptions);

// email template
const emailHTMLTemplate = ({email}) =>  `
<p><b>Dear ${email} </b></p>
<p> wassup </p>
 `;

 const emailVerificationHTMLTemplate = ({email,token}) =>  {
    const verificationLink = `https://guest-house-back.onrender.com/email/${email}/verify/${token}`;

  return  `<h3> Hi ${email},</h3> <br/>
    <p>We just need to verify your email address before you can access the <u>ONLINE BOOKING</u>.</p>
    
    <p>Verify your email address: ${verificationLink}</p>
    <br/>
    
    <p>Thanks! - The NITJ Guest House Online Booking team </p>`;
 }

 
 const adminNotificationTemplate = ({name, email, phone, address, refInfo, refName, refPhone}) =>  `
<h3>Hi,</h3> 
<p>A new user has registered:</p>
<table>
    <tr>
        <th>Name</th>
        <td>${name}</td>
    </tr>
    <tr>
        <th>Phone</th>
        <td>${phone}</td>
    </tr>
    <tr>
        <th>Email</th>
        <td>${email}</td>
    </tr>
    <tr>
        <th>Address</th>
        <td>${address}</td>
    </tr>
    <tr>
        <th>Reference Info</th>
        <td>${refInfo}</td>
    </tr>
    <tr>
        <th>Reference Name</th>
        <td>${refName}</td>
    </tr>
    <tr>
        <th>Reference Contact Details</th>
        <td>${refPhone}</td>
    </tr>
</table>
<br/>
<a href="#">Click here to approve</a>
`;

router.get("/", async (req,res) => {
    const mailOptions = {
        from: {
           name:"donotreply",
           address:"mrimann96@gmail.com",
        },
        to: "dhimanmridul91@gmail.com",
        subject: "Just checking",
        html : emailHTMLTemplate({email:"dhimanmridul91@gmail.com"})
    };


    try {
         await transporter.sendMail(mailOptions);
         res.json({message:"mail sent successfully"});
    }

    catch(err) {
        res.json({message: err.message})
    }
});




router.get("/verificationSuccess/:id",  (req, res)=> {
res.send(`<h1>${req.params.id} successfully verified</h1>`);
});





router.post("/sendVerificationEmail/", async (req,res) => {
   const email= req.body.email;
const token = req.body.token;

   const mailOptions = {
    from: {
       name:"donotreply",
       address:"mrimann96@gmail.com",
    },
    to: email,
    subject: "Confirm Your Email Address",
    html : emailVerificationHTMLTemplate({email, token})
};

try {
await transporter.sendMail(mailOptions);

res.redirect(`https://guest-house-back.onrender.com/email/verificationSuccess/${email}`);

}
catch(err) {
res.json({message: err.message})
}
})

router.get("/:id/verify/:token", async (req,res) => {
    const {id, token} = req.params;

try {
  const user = await User.find({verificationToken: token});

  if(user === null) {   
    throw new Error(`Email:  ${id} can't be verified`);
  }
const output = await User.updateOne({email: id}, {emailVerified: true});
if(output=== null )
 {
    throw new Error("user could not be updated");
 }  
res.redirect(`https://guest-house-back.onrender.com/email/verificationSuccess/${id}`);
}
catch(err) {
    res.status(500).json({message: err.message})
}
})


router.get("/adminNotification/:name/:email/:phone/:address/:refInfo/:refName/:refPhone", async (req,res) => {
    const {name, email, phone, address, refInfo, refName, refPhone} = req.params;

    const mailOptions = {
        from: {
            name: "donotreply",
            address: "mrimann96@gmail.com",
        },
        to: "mriduld.cs.21@nitj.ac.in",
        subject: "New user registration",
        html: adminNotificationTemplate({name, email, phone, address, refInfo, refName, refPhone}),
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({message: "Admin has been notified"});
    } catch (err) {
        res.json({message: err.message});
    }
});

module.exports = router;