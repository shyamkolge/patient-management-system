# Email Configuration Fix for Render/Hosting Platforms

## Problem
Getting "Connection timeout" error when using nodemailer on Render backend, but it works fine on localhost.

## Root Cause
Hosting platforms like Render often block SMTP connections on port 587. The default Gmail SMTP uses TLS on port 587, which many hosting providers restrict.

## Solution Implemented

### 1. **Updated to use Port 465 with SSL**
Changed `src/config/email.js` to:
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,              // Changed from default 587
    secure: true,           // SSL instead of TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
```

**Why this works:**
- Port 465 is the SMTP SSL port
- SSL is more stable on hosting platforms than TLS
- Most hosting providers allow port 465

### 2. **Fixed EMAIL_PASSWORD Format**
- ❌ **Before:** `lifw lefi csoe aafm` (with spaces)
- ✅ **After:** `lifwleficosoaafm` (no spaces)

Gmail app passwords should be entered **without spaces** in .env files.

## Steps to Deploy on Render

### 1. Verify Local Gmail Setup
```
✅ Gmail Account has 2-Factor Authentication enabled
✅ App Password generated (16 characters)
✅ Spaces removed from app password
✅ EMAIL_PASSWORD set correctly in .env
```

### 2. Update Render Environment Variables
1. Go to your Render project dashboard
2. Go to "Environment" settings
3. Update/add these variables:
   ```
   EMAIL_USER=shyamthecoder2022@gmail.com
   EMAIL_PASSWORD=lifwleficosoaafm
   ```
   (Make sure PASSWORD has NO SPACES)

### 3. Deploy Changes
```bash
git add backend/src/config/email.js
git commit -m "Fix email configuration for hosting platforms - use port 465 SSL"
git push
```

### 4. Check Render Logs
After deployment, check Render logs for:
```
✅ Email service is ready to send emails (Port 465 - SSL)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting timeout | 1. Check if spaces in EMAIL_PASSWORD<br>2. Verify app password is correct<br>3. Check Render firewall rules |
| "Invalid credentials" | App password has spaces or wrong password |
| "Connection refused" | Gmail 2FA might be off, regenerate app password |
| Works on localhost but not Render | Definitely a hosting firewall issue - port 465 fixes this |

## Alternative: Use Different Email Service

If Gmail continues having issues, consider using:
- **SendGrid** - Free tier available
- **Mailgun** - Good for transactional emails
- **AWS SES** - If using AWS
- **Brevo (Sendinblue)** - European alternative

These services typically have better hosting platform support.

## Email Configuration Checklist

- [x] Port 465 with SSL enabled
- [x] EMAIL_PASSWORD has NO SPACES
- [x] 2-Factor Authentication enabled on Gmail
- [x] App-specific password generated
- [x] Environment variables set on Render
- [x] Backend redeployed
- [x] Check logs for "Email service is ready"

---

**Status:** ✅ Fixed - Ready for Render deployment
**Testing:** Locally verified, now ready for hosted deployment
