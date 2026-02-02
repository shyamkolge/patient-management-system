import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter connection (non-blocking)
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter.verify(function (error, success) {
        if (error) {
            console.error('❌ Email configuration error:', error.message);
            console.log('\n⚠️  To fix email authentication:');
            console.log('1. Go to: https://myaccount.google.com/security');
            console.log('2. Enable 2-Step Verification');
            console.log('3. Go to: https://myaccount.google.com/apppasswords');
            console.log('4. Generate an App Password for "Mail"');
            console.log('5. Update EMAIL_PASSWORD in .env with the 16-char password\n');
        } else {
            console.log('✅ Email service is ready to send emails');
        }
    });
} else {
    console.log('⚠️  Email credentials not configured. Emails will not be sent.');
}

export default transporter;
