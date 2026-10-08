import nodemailer from 'nodemailer';
import { cacheService } from '../config/redis';

export class OtpService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter() {
    if (this.transporter) return this.transporter;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    }
    return this.transporter;
  }

  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOtp(email: string, otp: string, purpose = 'Verification'): Promise<boolean> {
    const cacheKey = `otp:${email.toLowerCase()}`;
    // Store in cache with 10-minute expiry (600s)
    await cacheService.set(cacheKey, otp, 600);

    const transporter = this.getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Smart Travel Platform <noreply@smarttravel.com>',
      to: email,
      subject: `Your Travel Platform OTP for ${purpose}: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0284c7; margin-bottom: 8px;">Smart Travel Recommendation Platform</h2>
          <p style="color: #4b5563; font-size: 16px;">Hello Traveler,</p>
          <p style="color: #4b5563; font-size: 16px;">Use the following One-Time Password (OTP) for your <strong>${purpose}</strong> request:</p>
          <div style="background-color: #f0fdf4; border: 1px dashed #22c55e; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #15803d;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Smart Travel Recommendation & Itinerary Planning Platform</p>
        </div>
      `,
    };

    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Sent OTP email to ${email}`);
        return true;
      } catch (err) {
        console.error('Failed to send email via SMTP, fallback to console log:', err);
      }
    }

    // Always log clearly to console for development / local testing
    console.log(`\n========================================`);
    console.log(`🔑 [OTP SERVICE] Code for ${email}: ${otp} (${purpose})`);
    console.log(`========================================\n`);
    return true;
  }

  static async verifyOtp(email: string, enteredOtp: string): Promise<boolean> {
    const cacheKey = `otp:${email.toLowerCase()}`;
    const storedOtp = await cacheService.get(cacheKey);

    if (!storedOtp) {
      return false;
    }

    if (storedOtp.trim() === enteredOtp.trim()) {
      // Invalidate after successful verification
      await cacheService.del(cacheKey);
      return true;
    }

    return false;
  }
}
