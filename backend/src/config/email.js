import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD exists:", process.env.EMAIL_PASSWORD);


// Create transporter for sending emails
// Using port 465 with SSL for better compatibility with hosting platforms like Render
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,          // ✅ use 587 on Render
    secure: false,      // ✅ must be false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});


// Verify transporter connection (non-blocking)
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter.verify(function (error, success) {
        if (error) {
            console.error('❌ Email configuration error:', error.message);
            console.log('\n⚠️  To fix email authentication on Render/Hosting:');
            console.log('1. Go to: https://myaccount.google.com/security');
            console.log('2. Enable 2-Step Verification');
            console.log('3. Go to: https://myaccount.google.com/apppasswords');
            console.log('4. Generate an App Password for "Mail"');
            console.log('5. Copy the 16-character password (remove spaces)');
            console.log('6. Update EMAIL_PASSWORD in .env\n');
            console.log('💡 Note: Using port 465 (SSL) for better compatibility\n');
        } else {
            console.log('✅ Email service is ready to send emails (Port 465 - SSL)');
        }
    });
} else {
    console.log('⚠️  Email credentials not configured. Emails will not be sent.');
}

export default transporter;
