const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendOTP(email, otp, username) {
    const mailOptions = {
      from: `"Naramakna" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Password - Kode OTP Anda',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Naramakna</h1>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Password</h2>
            
            <p>Halo <strong>${username}</strong>,</p>
            
            <p>Kami menerima permintaan untuk reset password akun Anda. Gunakan kode OTP berikut untuk melanjutkan:</p>
            
            <div style="background-color: #f1f3f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #1a73e8; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
            </div>
            
            <p><strong>Kode ini berlaku selama 5 menit.</strong></p>
            
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
            
            <p>Salam,<br>Tim Naramakna</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; 2025 Naramakna. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetConfirmation(email, username) {
    const mailOptions = {
      from: `"Naramakna" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Berhasil Direset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Naramakna</h1>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Berhasil Direset</h2>
            
            <p>Halo <strong>${username}</strong>,</p>
            
            <p>Password Anda telah berhasil direset. Anda sekarang dapat masuk dengan password baru Anda.</p>
            
            <p>Jika Anda tidak melakukan perubahan ini, segera hubungi tim support kami.</p>
            
            <p>Salam,<br>Tim Naramakna</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; 2025 Naramakna. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Password reset confirmation sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();