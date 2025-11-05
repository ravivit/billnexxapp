const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create transporter with Hostinger SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.HOSTINGER_EMAIL || 'contact@billnexx.com',
        pass: process.env.HOSTINGER_PASSWORD || 'Samsungz@2'
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.HOSTINGER_EMAIL || 'contact@billnexx.com',
      to: email,
      subject: 'Your OTP Verification Code - Billnexx',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f7fa; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .otp-box { background: linear-gradient(135deg, #1e88e5, #0d47a1); color: white; padding: 25px; border-radius: 10px; text-align: center; font-size: 32px; letter-spacing: 10px; margin: 25px 0; font-weight: bold; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
                .info-box { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="color: #1e88e5; margin: 0;">Email Verification</h2>
                </div>
                
                <p>Hello ${name || 'there'},</p>
                
                <p>Please use the following verification code to complete your registration:</p>
                
                <div class="otp-box">
                    ${otp.split('').join(' ')}
                </div>
                
                <div class="info-box">
                    <p><strong>⚠️ This OTP will expire in 10 minutes</strong></p>
                    <p><strong>📱 Enter this code in the verification page to continue</strong></p>
                </div>
                
                <p>If you didn't request this code, please ignore this email.</p>
                
                <div class="footer">
                    <p>© 2024 Billnexx. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // In production, store OTP in database with expiry
    // For now, we'll just return success
    console.log(`OTP ${otp} sent to ${email}`);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
};