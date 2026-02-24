const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    }
})

transporter.verify((error, success) => {
    if(error){
        console.error("Error connecting to email server : ", error);
    } else{
        console.log("Email server is ready to send messages")
    }
})

const sendEmail = async (to,subject,text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `From Bank <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        })

        console.log("Message sent : %s", info.messageId)
        console.log("Preview URL : %s", nodemailer.getTestMessageUrl(info))
    } catch (error) {
        console.error("Error sending email : ", error);
    }
}

const sendRegistrationEmail = async (userEmail, name) => {
    const subject = "Welcome to my Banking System!";
    const text = `Hello ${name}, \n\nThankyou for registering at Banking System. We are excited to have you on board\nBest regards,\nThe Banking System`;
    const html = `<p>Hello ${name},</p><p>Thankyou for registering at Banking System. We are excited to have you on board</p><p>\nBest regards,<br>The Banking System</p>`;

    await sendEmail(userEmail, subject, text, html);
}

const sendTransactionEmail = async (userEmail, name, amount, toAccount ) => {
    const subject = "Transaction Successful - Banking System";

    const text = `Hello ${name},

Your transaction of ₹${amount} has been successfully transferred to account ${toAccount}.

If you did not perform this transaction, please contact our support immediately.

Best regards,
The Banking System`;

    const html = `
        <p>Hello <b>${name}</b>,</p>
        <p>Your transaction of <b>₹${amount}</b> has been successfully transferred.</p>
        <p><b>Recipient Account:</b> ${toAccount}</p>
        <p>If you did not perform this transaction, please contact our support immediately.</p>
        <p>Best regards,<br>The Banking System</p>
    `;

    await sendEmail(userEmail, subject, text, html);
};

const sendTransactionFailEmail = async (
    userEmail,
    name,
    amount,
    toAccount
) => {
    const subject = "Transaction Failed - Banking System";

    const text = `Hello ${name},

Your transaction of ₹${amount} to account ${toAccount} could not be completed.

This may be due to insufficient balance, network issues, or incorrect account details. Please try again later.

If you did not initiate this transaction, please contact our support immediately.

Best regards,
The Banking System`;

    const html = `
        <p>Hello <b>${name}</b>,</p>
        <p>We regret to inform you that your transaction of <b>₹${amount}</b> could not be completed.</p>
        <p><b>Recipient Account:</b> ${toAccount}</p>
        <p>This may be due to insufficient balance, network issues, or incorrect account details. Please try again later.</p>
        <p>If you did not initiate this transaction, please contact our support immediately.</p>
        <p>Best regards,<br>The Banking System</p>
    `;

    await sendEmail(userEmail, subject, text, html);
};

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendTransactionFailEmail }    