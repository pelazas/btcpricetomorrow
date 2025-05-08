const nodeMailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(value, email){
    // Calculate tomorrow's date in readable format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = tomorrow.toLocaleDateString('en-US', options);

    // Round value to 2 decimal places
    const roundedValue = parseFloat(value).toFixed(2);

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bitcoin Price Prediction</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #1a73e8;">📈 Bitcoin Price Prediction</h2>
            <p>Hello,</p>
            <p>Here is the Bitcoin price prediction for <strong>${formattedDate} at 00:00</strong>:</p>
            <p style="font-size: 1.5em; font-weight: bold; color: #0f9d58;">$${roundedValue}</p>
            <p>This prediction is based on recent data trends and algorithmic analysis. We’ll send you an update every day with the latest forecast.</p>
            <p>Visit our site for more info: <a href="https://btcpricetomorrow.com" target="_blank">btcpricetomorrow.com</a></p>
            <hr style="margin-top: 30px;">
            <p style="font-size: 0.8em; color: #888;">This is an automated message. Please do not reply to this email.</p>
            <p style="font-size: 0.8em; color: #888;">If you want to unsubscribe from this newsletter, <a href="https://btcpricetomorrow.com/unsubscribe" target="_blank">click here</a>.</p>
        </div>
    </body>
    </html>
    `;

    const transporter = nodeMailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'noreply@btcpricetomorrow.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const info = await transporter.sendMail({
        from: '"BTC Price Tomorrow" <noreply@btcpricetomorrow.com>',
        to: email,
        subject: 'Bitcoin Price Prediction for Tomorrow',
        html: html,
    });

    console.log("Message sent!", info.messageId);
}

module.exports = sendEmail;
