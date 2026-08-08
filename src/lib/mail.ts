import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  // If no real SMTP config is provided, we can just log it for development
  if (!process.env.SMTP_USER) {
    console.log(`\n========================================================`);
    console.log(`Development Mode OTP for ${email}: ${otp}`);
    console.log(`========================================================\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Travingat" <noreply@travingat.com>',
      to: email,
      subject: 'Your Travingat Verification Code',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `<b>Your verification code is: ${otp}</b><br>It will expire in 10 minutes.`,
    });
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP to ${email}:`, error);
    throw new Error('Failed to send email');
  }
};
