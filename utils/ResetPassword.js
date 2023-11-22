const twilio = require('twilio');

const accountSid =  process.env.AccountSID;
const authToken = process.env.AccountToken;
const client = twilio(accountSid, authToken);

// Function to send SMS with verification code
const sendSMS = async function sendVerificationCode( msg ,phoneNumber) {
    try {
        const message = await client.messages.create({
            body: msg ,
            from: twilioPhone,
            to: phoneNumber
        });
        console.log(`Verification code sent: ${message.sid}`);
        return true; // Return true to indicate successful sending
    } catch (error) {
        console.error(`Error sending verification code: ${error}`);
        return false; // Return false to indicate failure
    }
}

module.exports = sendSMS;

// const verifySid = "VAee0117c465422c00f7ed46e32a6264fe";
// const client = require("twilio")(accountSid, authToken);

// client.verify.v2
//   .services(verifySid)
//   .verifications.create({ to: "+201022887277", channel: "sms" })
//   .then((verification) => console.log(verification.status))
//   .then(() => {
//     const readline = require("readline").createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });
//     readline.question("Please enter the OTP:", (otpCode) => {
//       client.verify.v2
//         .services(verifySid)
//         .verificationChecks.create({ to: "+201022887277", code: otpCode })
//         .then((verification_check) => console.log(verification_check.status))
//         .then(() => readline.close());
//     });
//   });