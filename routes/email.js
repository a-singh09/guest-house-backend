
const express = require("express");
const nodemailer = require("nodemailer");
const axios = require('axios');


const User = require("../models/user/user");
const bookingEmailRoute = require('./booking/bookingEmail');
const Login = require("../models/login");
const PendingUser = require("../models/pendingUsers");
const RegisteredUser = require("../models/registeredUsers");
const { REMOTE_URL, ADMIN_EMAIL, EMAIL_PASS, EMAIL_USER } = require('../config/env.config');
const RejectedUser = require("../models/rejectedUsers");

const router = express.Router();

//##### all the booking email notification will be handled here....
router.use("/booking", bookingEmailRoute);


const transportOptions = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: `${EMAIL_USER}`,
        pass: `${EMAIL_PASS}`,
    }
}




const transporter = nodemailer.createTransport(transportOptions);

// email template
const emailHTMLTemplate = ({ email }) => `<h3> Hi Guest,</h3> 

<p>Thank you for choosing the National Institute of Technology, Jalandhar (NITJ) Guest House for your upcoming stay.</p>
<p>To proceed with your guest house booking, it's important that we verify your email address. This is a crucial step to protect your information and enhance the security of our booking system.</p>
<p>Please click on the link below to verify your email address: <br/> verification Link</p>

<p>We look forward to welcoming you to the NITJ Guest House and hope you have a pleasant stay with us.</p>

<p>
Best regards,<br/>
NITJ Guest House
</p>`

const emailVerificationHTMLTemplate = ({ name, email, token }) => {
    const verificationLink = `${REMOTE_URL}/email/${email}/verify/${token}`;

    return `
    <h3> Dear Guest,</h3> 
    <p>Thank you for choosing the National Institute of Technology, Jalandhar (NITJ) Guest House for your upcoming stay.
    To proceed with your guest house booking, it's important that we verify your email address. This is a crucial step to protect your information and enhance the security of our booking system.</p>
    <p>Please click on the link below to verify your email address: <br/>
${verificationLink}
    </p>

    
    <p>We look forward to welcoming you to the NITJ Guest House and hope you have a pleasant stay with us.</p>
    
    <p>
    Best regards,<br/>
NITJ Guest House
    </p>`;
}


const adminNotificationTemplate = ({ name, email, phone, address, refInfo, refName, refPhone }) => `
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
    
</table>
<br/>
<a href="#">Click here to approve</a>
`;


const updatePasswordTemplate = ({ email, token }) => {

    const verificationLink = `${REMOTE_URL}/login/forgot-password/verify/${token}`;
    return `
    
Hi ${email},
<br/>
For your account security, please update your password by clicking on the link below:
<br/>
${verificationLink}
<br/>
This link is valid for 3 hours. Reach out to us at ${ADMIN_EMAIL}, if you encounter any issues.
<br/>
<br/>
Best Regards,
NITJ Guest House.
    `
}

router.get("/", async (req, res) => {
    const mailOptions = {
        from: {
            name: "donotreply",
            address: "mrimann96@gmail.com",
        },
        to: "dhimanmridul91@gmail.com",
        subject: "Just checking",
        html: emailHTMLTemplate({ email: "dhimanmridul91@gmail.com" })
    };


    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "mail sent successfully" });
    }

    catch (err) {
        res.json({ message: err.message })
    }
});




router.get("/verificationSuccess/:id/:option", async (req, res) => {
try {
    

  
    const option = req.params.option;
    const isNitUser = (Number(option) === 1 || Number(option) === 2);
    const info =  isNitUser ? " Now you can login to the dashboard with the valid credentials" : " Please wait for registration approval by admin.";
    res.write(`<h1>${req.params.id} successfully verified.</h1> <p>${info}</p>`);
    const [user] =  await User.find({email: req.params.id});

    if(user.emailVerified && isNitUser ) {
        const newLogin = new Login({
            email: user.email,
            password: user.password
        });
    
        const y = new RegisteredUser({
            user: user._id
          });   
    
          await Promise.all([
            newLogin.save(),
            PendingUser.deleteOne({user: user._id}),
            y.save()
          ]);
    
    }
   
}
catch(err) {
    res.json({message: err.message});
}
});


router.get("/forgot-password/:email/token/:token", async (req, res) => {
    const email = req.params.email;
    const token = req.params.token;
    console.log(email, token);
    const mailOptions = {
        from: {
            name: "donotreply",
            address: "mrimann96@gmail.com",
        },
        to: email,
        subject: "Urgent: Reset Your Password Now",
        html: updatePasswordTemplate({ email, token })
    };

    try {
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        res.json({ message: err.message })
    }
})

router.post("/sendApprovalNotification", async (req,res)=> {
const status = req.body.status;
const userId = req.body.userId;
try {

    const existingUser = await User.findById(userId);
    if(!existingUser) {
        throw new Error("User not found");
    }

    const email = existingUser.email;
    
    await transporter.sendMail({
        from: {
            name: "donotreply",
            address: "mrimann96@gmail.com",
        },
        to: email,
        subject: "Registration Approval Status",
        html: `
        <h3>Dear Sir/Mam,</h3>
       ${
         status === "accept"
           ? "<p>Your Registration request has been accepted by Guest House Admin. You can now access user dashboard using valid login credentials.</p>"
           : `<p>Your request has been rejected by Guest House Admin. Contact ${ADMIN_EMAIL} to get details.</p>`
       } 
        Best Regards,
        NITJ Guest House.
        `,

    })
    res.json({message: "mail sent successfully to user regarding registration approval"})
} catch (error) {
    console.log(error.message)
    res.json({message: error.message})
}
});


router.post("/sendVerificationEmail", async (req, res) => {
    console.log("sending verification mail");
    console.log(req.body);
    const email = req.body.email;
    const token = req.body.token;
    const name = req.body.name;

    const mailOptions = {
        from: {
            name: "donotreply",
            address: "mrimann96@gmail.com",
        },
        to: email,
        subject: "Verify Your Email for NITJ Guest House Booking",
        html: emailVerificationHTMLTemplate({ name, email, token })
    };

    try {
        await transporter.sendMail(mailOptions);

        // res.redirect(`${process.env.REMOTE_URL}/email/verificationSuccess/${email}`);

    }
    catch (err) {
        res.json({ message: err.message })
    }
})

router.get("/:id/verify/:token", async (req, res) => {
    const { id, token } = req.params;

    try {
        const user = await User.find({ verificationToken: token });

        if (user === null) {
            throw new Error(`Email:  ${id} can't be verified`);
        }

            const output = await User.updateOne({ email: id }, { emailVerified: true });
            if (output === null) {
                throw new Error("user could not be updated");
            }
      
        res.redirect(`${REMOTE_URL}/email/verificationSuccess/${id}/${user[0].registerOption}`);
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})




router.get("/adminNotification/:name/:email/:phone/:address/:refInfo/:refName", async (req, res) => {
    const { name, email, phone, address, refInfo, refName } = req.params;

    const mailOptions = {
        from: {
            name: "donotreply",
            address: "mrimann96@gmail.com",
        },
        to: `${ADMIN_EMAIL}`,
        subject: "New user registration",
        html: adminNotificationTemplate({ name, email, phone, address, refInfo, refName }),
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Admin has been notified" });
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.post("/reference-confirmation", async (req,res) => {

    const {referenceEmail, name, applicantEmail, refType } = req.body;
    const mailOptions = {
        from: {
            name: "donotreply",
            address: "mrimann96@gmail.com",
        },
        to: `${referenceEmail}`,
        subject: "Registration Verification",
        html: `
        <h3>Dear Sir/Mam,</h3>
      <p>This is an autogenerated email to inform you that a user has just registered to NITJ Guest House Website, providing your email as reference.
       As part of our evaluation process, we seek to verify the applicant's credentials and character through a reference check.</p>

       <div>
       <p> Below are the details of the applicant:  </p>
       <table>
       <tr>
          <th>Name: </th>
          <td>${name} </td>
       </tr>
       <tr>
          <th>Email: </th>
          <td>${applicantEmail} </td>
       </tr>
       <tr>
       <th> Reference Type: </th>
       <td> ${refType} </td>
       </tr>
       </table>
       </div>


       <div>
<p> Please click on Yes to approve the applicant's request and click on No to reject the applicant's request. </p>
<button style="padding:0.5rem 1rem;cursor:pointer;border-radius:4px;border:none;outline:none;background:blueviolet;">
<a style="cursor:pointer;text-decoration:none;color:white;"
 href="${REMOTE_URL}/email/reference-verification?status=accepted&email=${applicantEmail}">Yes</a>
</button>
<button style="padding:0.5rem 1rem;cursor:pointer;border-radius:4px;border:none;outline:none;background:red;">
<a style="cursor:pointer;text-decoration:none;color:white;" 
href="${REMOTE_URL}/email/reference-verification/?status=rejected&email=${applicantEmail}">No</a>
</button>
</div>


        <p>Best Regards,<br/>
        NITJ Guest House.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Admin has been notified" });
    } catch (err) {
        res.json({ message: err.message });
    }
})


router.get("/reference-verification", async (req,res) => {
    const { email, status } = req.query;

try {

    const user = await User.findOne({email});

    if(!user) {
        return res.status(401).json({message: "Unauthorized request"})
    }

const mailOptions = {
    from: {
        name: "donotreply",
        address: "mrimann96@gmail.com",
    },
    to: `${email}`,
    subject: "Registration Status",
    html: `
    <h3>Dear Sir/Madam,</h3>
    ${
      status === "accepted"
        ? "<p>Your request has been accepted by Reference. Please wait for the room allottment by Guest House Manager.</p>"
        : "<p>Your request has been rejected by Reference. Contact the reference you provided for more details.</p>"
    } 
     Best Regards, <br/>
     NITJ Guest House.
    `
};

    await transporter.sendMail(mailOptions);
    res.json({ message: "User has been notified regarding the registration." });

    let promises = [];
    
    if(status === 'accepted') {
         promises.push(axios.get(`${REMOTE_URL}/email/adminNotification/${encodeURIComponent(user.name)}/${encodeURIComponent(user.email)}/${encodeURIComponent(user.phone)}/${encodeURIComponent(user.address)}/${encodeURIComponent("faculty")}/${encodeURIComponent("-")}}`));
         promises.push(PendingUser.insertOne({ user: user._id }));
    }
    else if(status === 'rejected') {
    promises.push(RejectedUser.insertOne({user: user._id}));
    }


    await Promise.all(promises);


}
catch(err) {
    console.log({faculty_verif_msg: err.message});
    res.json({ message: "Could not verify email" });
}
})


module.exports = router;