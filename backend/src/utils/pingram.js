// NotificationAPI utility for appointment notifications
import notificationapi from 'notificationapi-node-server-sdk';

notificationapi.init(
  '9jl4er8tvfrl1zg7b0ig9e4kph', // Client ID
  'rjvqv6lkgjy5gb5ebzpg83eta43316hmvjzuyfhb4lmzv30wr27ixarkgu' // Client Secret
);

/**
 * Send appointment confirmation notification (SMS and call) to patient
 * @param {Object} param0
 * @param {string} param0.toNumber - Patient's phone number (E.164 format)
 * @param {string} param0.toEmail - Patient's email
 * @param {string} param0.toId - Patient's unique id (can be email)
 * @param {string} param0.smsMessage - SMS message
 * @param {string} param0.callMessage - Call message
 * @param {string} [param0.emailSubject] - Email subject (optional)
 * @param {string} [param0.emailHtml] - Email HTML (optional)
 */
export async function sendAppointmentConfirmedNotification({
  toNumber,
  toEmail,
  toId,
  smsMessage,
  callMessage,
  emailSubject,
  emailHtml
}) {
  try {
    const payload = {
      type: 'appointment_confirmed',
      to: {
        id: toId,
        email: toEmail,
        number: toNumber
      }
    };
    if (emailSubject && emailHtml) {
      payload.email = {
        subject: emailSubject,
        html: emailHtml
      };
    }
    if (smsMessage) {
      payload.sms = { message: smsMessage };
    }
    if (callMessage) {
      payload.call = { message: callMessage };
    }
    const res = await notificationapi.send(payload);
    return res.data;
  } catch (error) {
    console.error('NotificationAPI error:', error.response?.data || error.message || error);
    throw error;
  }
}
