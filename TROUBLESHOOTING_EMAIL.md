# Email Sending Issues - Troubleshooting Guide

## Problem
✅ Email works locally but NOT on hosted app

## Root Causes & Solutions

### 1. 🔴 CRITICAL: Gmail App Password (80% of cases)
**Status:** Your app uses Gmail SMTP with port 465 (SSL)

**Why it fails on hosting:**
- Hosting platforms (Render, Heroku, Railway, etc.) don't allow regular Gmail passwords
- You MUST use a 16-character App Password, not your regular Gmail password

**Fix:**
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if needed)
3. Go to https://myaccount.google.com/apppasswords
4. Select: **Mail** + **Windows Computer** (or your OS)
5. Google generates a 16-character password - **COPY IT EXACTLY** (no spaces)
6. Update your hosting platform's environment variables:
   - `EMAIL_USER`: your-email@gmail.com
   - `EMAIL_PASSWORD`: xxxxxxxxxxxxxxxx (the 16-char app password)

---

### 2. 📋 Environment Variables Not Set

**Where to set them based on your hosting:**

#### Render.com
- Dashboard → Your App → Environment
- Add these variables:
  - `EMAIL_USER` = your-email@gmail.com
  - `EMAIL_PASSWORD` = app-password

#### Vercel
- Project Settings → Environment Variables
- Add the same variables

#### Railway.app
- Variables tab
- Add the same variables

#### Heroku
- Settings → Config Vars (Reveal Config Vars)
- Add the same variables

---

### 3. 🔍 Verify Your Setup

**Check if your transporter is logging correctly:**

Run this in your production logs:
```bash
# Look for one of these messages when server starts:
✅ Email service is ready to send emails (Port 465 - SSL)
# OR
❌ Email configuration error: ...
```

If you see the error message, it confirms the credentials are wrong.

---

### 4. 🧪 Test Email Endpoint

Create a test route to verify email works (temporary):

```javascript
// Add to your routes/test.routes.js or similar
import express from 'express';
import { sendPaymentReceiptEmail } from '../utils/email.js';

const router = express.Router();

router.post('/test-email', async (req, res) => {
    try {
        const result = await sendPaymentReceiptEmail(
            'your-email@gmail.com', // recipient
            'Test Patient',
            {
                paymentId: 'TEST123',
                orderId: 'ORDER123',
                amount: 50000,
                doctorName: 'Dr. Test',
                paymentDate: new Date(),
                paymentMethod: 'Razorpay',
            }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
```

Then call: `POST /test-email` from your hosting server

---

### 5. 📝 Checklist

- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated (16 characters)
- [ ] App Password copied correctly (no spaces)
- [ ] `EMAIL_USER` set in hosting environment
- [ ] `EMAIL_PASSWORD` set in hosting environment (use app password)
- [ ] Server restarted after setting env vars
- [ ] Check logs for "✅ Email service is ready..." message
- [ ] Test email with actual payment/appointment
- [ ] Check spam folder in receiving email

---

### 6. 🛠️ Debugging Steps

**Step 1:** SSH into your hosting server and check env vars:
```bash
echo $EMAIL_USER
echo $EMAIL_PASSWORD
```

**Step 2:** Check server logs during email send attempt
```bash
# Look for these messages:
✅ Payment receipt email sent: message-id@gmail.com
❌ Error sending payment receipt email: ...
```

**Step 3:** If error shows "Invalid login", it's the app password issue
- Delete current EMAIL_PASSWORD
- Generate new one from Google
- Update hosting platform env var
- Restart server

---

### Current Configuration

Your app setup (from inspection):
- ✅ Email Library: Nodemailer v7.0.13
- ✅ SMTP Host: smtp.gmail.com
- ✅ SMTP Port: 465 (SSL)
- ✅ Email functions: sendPaymentReceiptEmail, sendAppointmentConfirmationEmail
- ⚠️ NotificationAPI: Also being used for SMS/calls

---

## Still Not Working?

Try these:

1. **Check for typos:**
   - Is `EMAIL_USER` exactly as it appears in Gmail?
   - Is `EMAIL_PASSWORD` copied with all 16 characters?

2. **Gmail security settings:**
   - Go to https://myaccount.google.com/lesssecureapps
   - Allow "Less secure app access" (if option appears)

3. **Port 587 fallback:**
   If port 465 still fails, try updating email.js:
   ```javascript
   const transporter = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 587,  // Changed from 465
       secure: false,  // Changed from true
       auth: { ... }
   });
   ```

4. **Check email service status:**
   - Visit https://www.gmail.com/status
   - Ensure Gmail is not experiencing issues

---

## What Changed from Local to Production?

Local (.env file):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-regular-password
```

Production (hosting env vars):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=sixteen-char-app-password  ← MUST USE APP PASSWORD
```

**This is the #1 reason emails fail on hosting!**
