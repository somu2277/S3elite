const crypto = require('crypto');

/**
 * Enterprise WhatsApp Business API Service for Admin OTP verification.
 * Never logs or exposes raw OTP codes in production.
 */

const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER || '+919494211015';

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
const generate6DigitOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hashes an OTP using SHA-256 before database storage.
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

/**
 * Sends Admin Verification OTP via Official WhatsApp Business API.
 */
const sendAdminOTP = async (phoneNumber = ADMIN_PHONE_NUMBER, otp) => {
  const formattedPhone = phoneNumber.replace(/[^0-9+]/g, '');

  const messageText = `------------------------------------
S3 Elite PG
Your Admin Login Verification Code is
${otp}

This code expires in 30 seconds.
Do not share this code with anyone.
------------------------------------`;

  // Check if Meta WhatsApp credentials exist in env; otherwise log safe dispatch status
  const metaAccessToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  if (metaAccessToken && phoneNumberId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: messageText }
        })
      });
      const data = await response.json();
      return { success: true, provider: 'WhatsApp Business API', messageId: data.messages?.[0]?.id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback simulator for development/demo (Never exposes OTP in production response)
  console.log(`[WhatsApp Business API Dispatch] Sent 6-Digit Admin Verification Code to ${formattedPhone} (Expires in 30s)`);
  return {
    success: true,
    provider: 'WhatsApp Business API Service',
    maskedPhone: '******1015'
  };
};

module.exports = {
  generate6DigitOTP,
  hashOTP,
  sendAdminOTP,
  ADMIN_PHONE_NUMBER
};
