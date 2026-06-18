import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

const isDevelopmentKey = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_123456789";

const sendVerificationEmail = async (email, username, verificationCode) => {
    try {
        // Log the verification code for local development testing
        console.log(`\n==============================================`);
        console.log(`DEVELOPMENT MODE: Verification Email Intercepted`);
        console.log(`To: ${email}`);
        console.log(`Verification Code: ${verificationCode}`);
        console.log(`==============================================\n`);

        if (isDevelopmentKey) {
            console.log("Skipping actual email dispatch because a valid RESEND_API_KEY is not set in .env");
            return;
        }

        const { data, error } = await resend.emails.send({
            from: "CuriosityAI <onboarding@resend.dev>",
            to: email,
            subject: "Verify Your Email - CuriosityAI",
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
                        </div>
                        <p style="color: #6b7280; font-size: 14px; text-align: center;">
                            If the button doesn't work, you can also copy and paste the code manually.
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

        if (error) {
            console.error("Error sending verification email:", error);
            return;
        }

        console.log("Verification email sent successfully:", data);
    } catch (error) {
        console.error("Catch error sending verification email:", error);
    }
};

const sendResetPasswordEmail = async (email, username, resetCode) => {
    try {
        // Log the reset code for local development testing
        console.log(`\n==============================================`);
        console.log(`DEVELOPMENT MODE: Reset Password Intercepted`);
        console.log(`To: ${email}`);
        console.log(`Reset Code: ${resetCode}`);
        console.log(`==============================================\n`);

        if (isDevelopmentKey) {
            console.log("Skipping actual email dispatch because a valid RESEND_API_KEY is not set in .env");
            return;
        }

        const { data, error } = await resend.emails.send({
            from: "CuriosityAI <onboarding@resend.dev>",
            to: email,
            subject: "Reset Your Password - CuriosityAI",
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

        if (error) {
            console.error("Error sending password reset email:", error);
            return;
        }

        console.log("Password reset email sent successfully:", data);
    } catch (error) {
        console.error("Catch error sending password reset email:", error);
    }
};

export { sendVerificationEmail, sendResetPasswordEmail };