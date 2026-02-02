# Email Configuration Guide - Nodemailer Setup

## Overview
This system now sends automated emails to patients when they complete online payments via Razorpay. Payment receipts are delivered instantly with all transaction details.

## 🔧 Configuration Steps

### 1. **Gmail Setup (for sending emails)**

#### Step 1: Enable 2-Factor Authentication
- Go to [Google Account Security](https://myaccount.google.com/security)
- Enable "2-Step Verification"

#### Step 2: Generate App Password
- Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
- Select "Mail" and "Windows Computer" (or your device)
- Generate a 16-character app password
- Copy this password

#### Step 3: Update Environment Variables
In your `.env` file, add:
```bash
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
```

**Example:**
```bash
EMAIL_USER=arjun@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 2. **Test Email Configuration**
Start the backend server:
```bash
cd backend
npm run dev
```

Check the console output for:
```
✅ Email service is ready to send emails
```

If you see an error, verify your Gmail app password is correct.

## 📧 Email Features

### Payment Receipt Email
**Triggered:** When patient completes payment (after Razorpay verification)
**Recipient:** Patient's email address
**Content includes:**
- Transaction ID
- Order ID
- Amount paid
- Doctor name
- Payment date & method
- Consultation details
- Payment status badge

**Features:**
- ✅ Professional HTML email template
- ✅ Mobile-responsive design
- ✅ Clear receipt layout
- ✅ Doctor and service details
- ✅ Payment verification status

## 🔌 API Endpoint

### Verify Payment & Send Receipt
**POST** `/api/payment/verify`

**Request body:**
```json
{
  "orderId": "order_123456",
  "paymentId": "pay_123456",
  "signature": "signature_hash",
  "doctorId": "doctor_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "emailSent": true,
  "payment": {
    "id": "pay_123456",
    "amount": 50000,
    "currency": "INR",
    "status": "captured"
  }
}
```

## 🚀 Integration with Frontend

The frontend payment verification should call the `/api/payment/verify` endpoint after successful Razorpay payment:

```javascript
// After successful Razorpay payment
const response = await api.post('/payment/verify', {
  orderId: razorpayResponse.order_id,
  paymentId: razorpayResponse.razorpay_payment_id,
  signature: razorpayResponse.razorpay_signature,
  doctorId: selectedDoctorId
});
```

## 📋 Email Templates Available

### 1. **Payment Receipt** (`sendPaymentReceiptEmail`)
- Sent after successful payment
- Includes full transaction details
- Doctor information
- Next steps for consultation

### 2. **Appointment Confirmation** (`sendAppointmentConfirmationEmail`)
- Can be used when appointment is scheduled
- Includes date, time, doctor details

### 3. **Generic Email** (`sendEmail`)
- Reusable function for custom emails
- Pass custom HTML content

## ⚙️ Environment Variables Required

```bash
# Gmail Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Razorpay (existing)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# All other existing variables...
```

## 🐛 Troubleshooting

### "Error: Invalid login"
- ✓ Check EMAIL_USER is correct Gmail address
- ✓ Verify EMAIL_PASSWORD is the 16-char app password (not main password)
- ✓ Ensure 2FA is enabled on Gmail account

### "Email not sent"
- ✓ Check internet connection
- ✓ Verify EMAIL_USER and EMAIL_PASSWORD in .env
- ✓ Check console for detailed error messages
- ✓ Verify patient email is valid in database

### "Connection timeout"
- ✓ Gmail SMTP might be blocked - check firewall
- ✓ Verify EMAIL_USER is correct format (with @gmail.com)

## 📊 Production Checklist

- [ ] Set EMAIL_USER and EMAIL_PASSWORD in production .env
- [ ] Test payment flow end-to-end with test data
- [ ] Verify email arrives in patient inbox (and spam folder)
- [ ] Customize email templates with hospital logo/branding if needed
- [ ] Set up email error logging/monitoring
- [ ] Consider rate limiting for email sends (if high volume)

## 🔐 Security Notes

- Never commit `.env` file with real credentials
- Use app-specific passwords, not main Gmail password
- Rotate credentials regularly
- Monitor email send failures in logs
- Consider using SendGrid or Mailgun for production (more reliable)

## 📞 Future Enhancements

- [ ] Add email templates to database for customization
- [ ] Implement email resend functionality
- [ ] Add SMS alerts alongside email
- [ ] Create email preview in admin dashboard
- [ ] Add email tracking/delivery confirmation
- [ ] Implement scheduled appointment reminders
- [ ] Add automatic invoice generation

---

**Status:** ✅ Nodemailer integration complete and ready for use
**Tested:** Payment verification with email sending
**Last Updated:** February 2, 2026
