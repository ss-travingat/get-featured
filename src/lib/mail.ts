import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  // If no real SMTP config is provided, we can just log it for development
  if (!process.env.SMTP_EMAIL) {
    console.log(`\n========================================================`);
    console.log(`Development Mode OTP for ${email}: ${otp}`);
    console.log(`========================================================\n`);
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #111111;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #111111;
          padding: 40px 0;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          background-color: #1a1a1a;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }
        .header {
          text-align: center;
          padding: 40px 32px 24px;
        }
        .header img {
          max-width: 160px;
          height: auto;
        }
        .content {
          padding: 0 40px 40px;
          text-align: center;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 12px;
          margin-top: 0;
          letter-spacing: -0.02em;
        }
        .text {
          font-size: 15px;
          color: #a3a3a3;
          line-height: 1.6;
          margin-bottom: 32px;
          margin-top: 0;
        }
        .otp-box {
          background-color: #262626;
          border: 1px solid #404040;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .otp-code {
          font-size: 42px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 12px;
          margin: 0;
          margin-left: 12px; /* Center compensate for letter-spacing */
        }
        .footer {
          padding: 24px 40px;
          background-color: #1a1a1a;
          text-align: center;
          font-size: 13px;
          color: #737373;
          border-top: 1px solid #262626;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <img src="${process.env.NEXT_PUBLIC_LANDING_ASSETS_CDN_BASE}/get-featured/travingat-logo.png" alt="Travingat" />
          </div>
          <div class="content">
            <h1 class="title">Verify your email</h1>
            <p class="text">Please use the verification code below to continue your application to Travingat.</p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>
            <p class="text">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Travingat. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Travingat" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your Travingat Verification Code',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: htmlContent
    });
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP to ${email}:`, error);
    throw new Error('Failed to send email');
  }
};
