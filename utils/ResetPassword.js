const twilio = require('twilio');

const accountSid =  process.env.AccountSID;
const authToken = process.env.AccountToken;
const verifySid = "VAee0117c465422c00f7ed46e32a6264fe";
const client = require("twilio")(accountSid, authToken);


// exports.sendCustomSMS = async function sendCustomMessage(message, phoneNumber) {   //not free 
//     try {
//         const sentMessage = await client.messages.create({
//             body: message,
//             from: "+201022887277", 
//             to: "+201022887277"
//         });
//         console.log(`Message sent: ${sentMessage.sid}`);
//         return true; // Return true for successful sending
//     } catch (error) {
//         console.error(`Error sending message: ${error}`);
//         return false; // Return false for sending failure
//     }
// };

exports.sendSMS = async function sendVerificationCode(phoneNumber) {   //in trial mood allow phoneverified in my acc only but in the paid all is allowed 👍
    try {
        const verification = await client.verify.v2
            .services(verifySid)
            .verifications.create({ to: "+201022887277", channel: "sms" }); // to phoneNumber
        console.log(verification.status); 
        return true;
    } catch (error) {
        console.error(`Error sending verification code: ${error}`);
        return false; 
    }
};

// Function to handle user verification using Twilio
exports.verifyUser = async function verifyUserOTP(phoneNumber, otpCode) {
    try {
        const verificationCheck = await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: "+201022887277", code: otpCode });  //to phoneNumber
       // console.log(verificationCheck.status); 
        return verificationCheck.status === 'approved'; 
    } catch (error) {
        console.error(`Error verifying OTP: ${error}`);
        return false; 
    }
};

