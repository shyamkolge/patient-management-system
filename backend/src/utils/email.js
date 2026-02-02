import transporter from '../config/email.js';

/**
 * Send payment receipt email to patient
 */
export const sendPaymentReceiptEmail = async (email, patientName, paymentDetails) => {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333;
        }
        .receipt-section {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .receipt-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .receipt-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
            font-size: 14px;
        }
        .receipt-item:last-child {
            border-bottom: none;
        }
        .receipt-item-label {
            color: #666;
            font-weight: 500;
        }
        .receipt-item-value {
            color: #333;
            font-weight: 600;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            margin-top: 10px;
            border-top: 2px solid #667eea;
            border-bottom: 2px solid #667eea;
            font-size: 16px;
        }
        .total-label {
            font-weight: 600;
            color: #333;
        }
        .total-amount {
            font-size: 20px;
            font-weight: 700;
            color: #667eea;
        }
        .status {
            display: inline-block;
            background-color: #4caf50;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 15px;
        }
        .status.success {
            background-color: #4caf50;
        }
        .doctor-info {
            background-color: #f0f7ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .doctor-info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .doctor-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 Payment Receipt</h1>
            <p>Your consultation payment has been received</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>Thank you for your payment! Your consultation has been successfully scheduled.</p>
            </div>

            <div class="doctor-info">
                <div class="doctor-info-label">👨‍⚕️ Consulting Doctor</div>
                <div class="doctor-name">${paymentDetails.doctorName || 'Dr. {Doctor Name}'}</div>
            </div>

            <div class="receipt-section">
                <div class="receipt-title">📋 Payment Details</div>
                
                <div class="receipt-item">
                    <span class="receipt-item-label">Transaction ID</span>
                    <span class="receipt-item-value">${paymentDetails.paymentId || 'N/A'}</span>
                </div>
                
                <div class="receipt-item">
                    <span class="receipt-item-label">Order ID</span>
                    <span class="receipt-item-value">${paymentDetails.orderId || 'N/A'}</span>
                </div>
                
                <div class="receipt-item">
                    <span class="receipt-item-label">Service</span>
                    <span class="receipt-item-value">Online Consultation</span>
                </div>
                
                <div class="receipt-item">
                    <span class="receipt-item-label">Payment Date</span>
                    <span class="receipt-item-value">${new Date(paymentDetails.paymentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div class="receipt-item">
                    <span class="receipt-item-label">Payment Method</span>
                    <span class="receipt-item-value">${paymentDetails.paymentMethod || 'Razorpay'}</span>
                </div>

                <div class="total-row">
                    <span class="total-label">Amount Paid</span>
                    <span class="total-amount">₹ ${(paymentDetails.amount / 100).toFixed(2)}</span>
                </div>

                <div style="text-align: center; margin-top: 15px;">
                    <span class="status success">✓ PAYMENT SUCCESSFUL</span>
                </div>
            </div>

            <div style="background-color: #fffbea; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 14px; color: #333; margin-bottom: 10px;"><strong>⏱️ Next Steps</strong></p>
                <ul style="font-size: 13px; color: #666; margin-left: 20px;">
                    <li>Your consultation has been scheduled</li>
                    <li>You'll receive a confirmation link via email</li>
                    <li>Join your video consultation at the scheduled time</li>
                    <li>Keep this receipt for your records</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>Patient Records Management System</strong></p>
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>For support, contact us at support@hospitalerp.com</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Payment Receipt - Consultation with ${paymentDetails.doctorName || 'Doctor'}`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Payment receipt email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending payment receipt email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send appointment confirmation email to patient
 */
export const sendAppointmentConfirmationEmail = async (email, patientName, appointmentDetails) => {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
        .detail { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Appointment Confirmed</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${patientName}</strong>,</p>
            <p>Your appointment has been confirmed. Here are the details:</p>
            <div class="appointment-card">
                <div class="detail">
                    <span>👨‍⚕️ Doctor:</span>
                    <span><strong>${appointmentDetails.doctorName}</strong></span>
                </div>
                <div class="detail">
                    <span>📅 Date:</span>
                    <span><strong>${appointmentDetails.date}</strong></span>
                </div>
                <div class="detail">
                    <span>⏰ Time:</span>
                    <span><strong>${appointmentDetails.time}</strong></span>
                </div>
            </div>
        </div>
        <div class="footer">
            <p>Patient Records Management System</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Appointment Confirmed - ${appointmentDetails.date}`,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending appointment confirmation:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send generic email notification
 */
export const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send prescription email to patient after consultation
 */
export const sendPrescriptionEmail = async (email, patientName, prescriptionDetails) => {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333;
        }
        .doctor-info {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .doctor-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .specialization {
            font-size: 13px;
            color: #666;
            margin-top: 3px;
        }
        .prescription-section {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #10b981;
            padding-bottom: 8px;
        }
        .medication-card {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
        }
        .medication-card:last-child {
            margin-bottom: 0;
        }
        .med-name {
            font-size: 16px;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 8px;
        }
        .med-detail {
            display: flex;
            padding: 5px 0;
            font-size: 14px;
        }
        .med-label {
            font-weight: 600;
            color: #666;
            width: 120px;
        }
        .med-value {
            color: #333;
            flex: 1;
        }
        .summary-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .summary-title {
            font-size: 14px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
        }
        .summary-content {
            font-size: 13px;
            color: #78350f;
            line-height: 1.6;
            white-space: pre-line;
        }
        .instructions-box {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .instructions-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
        }
        .instructions-content {
            font-size: 13px;
            color: #1e40af;
            line-height: 1.6;
        }
        .next-steps {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .next-steps ul {
            margin-left: 20px;
            color: #333;
        }
        .next-steps li {
            margin: 8px 0;
            font-size: 14px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 5px 0;
        }
        .badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💊 Prescription Details</h1>
            <p>Your consultation is complete</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Dear <strong>${patientName}</strong>,</p>
                <p>Thank you for your consultation. Here are your prescription details:</p>
            </div>

            ${prescriptionDetails.doctorName ? `
            <div class="doctor-info">
                <div class="doctor-name">👨‍⚕️ ${prescriptionDetails.doctorName}</div>
                ${prescriptionDetails.specialization ? `<div class="specialization">${prescriptionDetails.specialization}</div>` : ''}
            </div>
            ` : ''}

            ${prescriptionDetails.consultationSummary ? `
            <div class="summary-box">
                <div class="summary-title">📋 Consultation Summary</div>
                <div class="summary-content">${prescriptionDetails.consultationSummary}</div>
            </div>
            ` : ''}

            <div class="prescription-section">
                <div class="section-title">💊 Prescribed Medications</div>
                
                ${prescriptionDetails.medications && prescriptionDetails.medications.length > 0 ? 
                    prescriptionDetails.medications.map((med, idx) => `
                    <div class="medication-card">
                        <div class="med-name">${idx + 1}. ${med.name}</div>
                        <div class="med-detail">
                            <span class="med-label">Dosage:</span>
                            <span class="med-value">${med.dosage || 'As directed'}</span>
                        </div>
                        <div class="med-detail">
                            <span class="med-label">Frequency:</span>
                            <span class="med-value">${med.frequency || 'As directed'}</span>
                        </div>
                        <div class="med-detail">
                            <span class="med-label">Duration:</span>
                            <span class="med-value">${med.duration || 'As directed'}</span>
                        </div>
                        ${med.instructions ? `
                        <div class="med-detail">
                            <span class="med-label">Instructions:</span>
                            <span class="med-value">${med.instructions}</span>
                        </div>
                        ` : ''}
                    </div>
                    `).join('') 
                : '<p style="color: #666; text-align: center; padding: 20px;">No medications prescribed</p>'}
            </div>

            ${prescriptionDetails.instructions ? `
            <div class="instructions-box">
                <div class="instructions-title">⚠️ Important Instructions</div>
                <div class="instructions-content">${prescriptionDetails.instructions}</div>
            </div>
            ` : ''}

            <div class="next-steps">
                <p style="font-weight: 600; color: #333; margin-bottom: 10px;">📌 Important Reminders:</p>
                <ul>
                    <li>Take medications exactly as prescribed</li>
                    <li>Complete the full course even if you feel better</li>
                    <li>Set reminders to avoid missing doses</li>
                    <li>Note any side effects and inform your doctor</li>
                    <li>Attend follow-up appointments as scheduled</li>
                    <li>Store medications properly as per instructions</li>
                </ul>
            </div>

            ${prescriptionDetails.followUpDate ? `
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-weight: 600; color: #92400e; margin-bottom: 5px;">📅 Follow-up Appointment</p>
                <p style="color: #78350f; font-size: 14px;">${new Date(prescriptionDetails.followUpDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 25px 0;">
                <span class="badge">✓ Prescription Issued</span>
            </div>
        </div>

        <div class="footer">
            <p><strong>Patient Records Management System</strong></p>
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>For support, contact us at support@hospitalerp.com</p>
            <p style="margin-top: 10px; color: #999;">© 2026 Medical Clinic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Prescription from ${prescriptionDetails.doctorName || 'Your Doctor'}`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Prescription email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending prescription email:', error);
        return { success: false, error: error.message };
    }
};

