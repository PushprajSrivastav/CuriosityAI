import nodemailer from "nodemailer";
import dns from "dns";

const config = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    // Force IPv4 lookup to bypass Render's lack of IPv6 support (fixes ENETUNREACH error)
    lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
    },
    auth: process.env.GOOGLE_APP_PASSWORD 
        ? {
            user: process.env.GOOGLE_USER,
            pass: process.env.GOOGLE_APP_PASSWORD,
          }
        : {
            type: "OAuth2",
            user: process.env.GOOGLE_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          }
};

const transporter = nodemailer.createTransport(config);
transporter.verify((err, success) => {
    if (err) {
        console.error("Error connecting to Gmail:", err);
    } else {
        console.log("Successfully connected to Gmail");
    }
});

const sendVerificationEmail = async (email, username, verificationCode) => {
    try {
        await transporter.sendMail({
            from: `"CuriosityAI Team" <${process.env.GOOGLE_USER}>`,
            to: email,
            subject: "Verify Your Email - CuriosityAI",
            text: `Hi ${username}, your verification code is ${verificationCode}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; padding-bottom: 20px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">CuriosityAI</h1>
                    </div>
                    <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                        <h2 style="color: #111827; margin-top: 0;">Verify your email address</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi <strong>${username}</strong>,
                        </p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Thank you for joining CuriosityAI! To complete your registration, please use the verification code below:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; padding: 12px 24px; background-color: #f3f4f6; color: #4f46e5; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin-bottom: 20px;">
                                ${verificationCode}
                            </span>
                            <br />
                            <a href="http://localhost:3000/api/auth/verify?code=${verificationCode}&email=${email}" 
                               style="display: inline-block; padding: 14px 30px; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                                Verify Email Now
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; text-align: center;">
                            If the button doesn't work, you can also copy and paste the code manually.
                        </p>
                        <p style="color: #6b7280; font-size: 14px; text-align: center;">
                            This link and code are valid for 10 minutes.
                        </p>
                    </div>
                    <div style="text-align: center; padding-top: 20px; color: #9ca3af; font-size: 12px;">
                        <p>&copy; 2024 CuriosityAI Inc. All rights reserved.</p>
                        <p>123 Tech Street, Silicon Valley, CA</p>
                    </div>
                </div>
            `,
        });
        console.log("Verification email sent successfully");
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};

const sendResetPasswordEmail = async (email, username, resetCode) => {
    try {
        await transporter.sendMail({
            from: `"CuriosityAI Team" <${process.env.GOOGLE_USER}>`,
            to: email,
            subject: "Reset Your Password - CuriosityAI",
            text: `Hi ${username}, your password reset code is ${resetCode}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; padding-bottom: 20px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">CuriosityAI</h1>
                    </div>
                    <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                        <h2 style="color: #111827; margin-top: 0;">Reset Password Request</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi <strong>${username}</strong>,
                        </p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We received a request to reset your password. Use the 6-digit verification code below to verify your identity and set a new password:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; padding: 12px 24px; background-color: #f3f4f6; color: #4f46e5; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
                                ${resetCode}
                            </span>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; text-align: center;">
                            If you did not request a password reset, please ignore this email.
                        </p>
                        <p style="color: #6b7280; font-size: 14px; text-align: center;">
                            This code is valid for 10 minutes.
                        </p>
                    </div>
                    <div style="text-align: center; padding-top: 20px; color: #9ca3af; font-size: 12px;">
                        <p>&copy; 2024 CuriosityAI Inc. All rights reserved.</p>
                    </div>
                </div>
            `,
        });
        console.log("Password reset email sent successfully");
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};

export { sendVerificationEmail, sendResetPasswordEmail };