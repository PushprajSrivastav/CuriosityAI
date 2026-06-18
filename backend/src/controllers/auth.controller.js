import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/mail.services.js";
// ─── Register ────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check: User pehle se exists karta hai?
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 1. Password ko secure (hash) karo (Aap yeh step bhool gaye the!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. 6-digit OTP generate karo
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min valid

    // 3. Naya user banao (Hashed Password aur OTP ke saath)
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiry,
    });

    // 4. Professional Verification email bhejo (Ab username bhi bhej rahe hain)
    await sendVerificationEmail(email, username, verificationCode);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Check your email for verification code.",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─── Login ───────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User dhundo
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 2. Password match karo
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Verification check karo (Jab tak verify nahi hoga, login nahi hoga)
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address first before logging in.",
      });
    }

    // JWT Token banao
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    // Token cookie mein bhejo
    res.cookie("token", token, {
      httpOnly: true,   // JS se access nahi hoga (XSS protection)
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
      stack: error.stack
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.query;
    const wantsJson = req.headers.accept && req.headers.accept.includes("application/json");

    if (!email || !code) {
      if (wantsJson) {
        return res.status(400).json({ success: false, message: "Missing email or verification code." });
      }
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">Verification Failed</h1>
          <p>Missing email or verification code.</p>
        </div>
      `);
    }

    // User dhundo
    const user = await UserModel.findOne({ email });

    if (!user) {
      if (wantsJson) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(404).send("User not found");
    }

    // Check if already verified
    if (user.verified) {
      if (wantsJson) {
        return res.status(200).json({ success: true, message: "Email already verified!" });
      }
      return res.status(200).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #10b981;">Already Verified!</h1>
          <p>Your email is already verified. You can now login.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a>
        </div>
      `);
    }

    // OTP match karo aur expiry check karo
    if (user.verificationCode !== code) {
      if (wantsJson) {
        return res.status(400).json({ success: false, message: "Invalid verification code" });
      }
      return res.status(400).send("Invalid verification code");
    }

    if (new Date() > user.verificationCodeExpiry) {
      if (wantsJson) {
        return res.status(400).json({ success: false, message: "Verification code has expired" });
      }
      return res.status(400).send("Verification code has expired");
    }

    // User ko verify mark karo
    user.verified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    // JWT Token banao (To automatically login the user upon verification)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    // Token cookie mein bhejo
    res.cookie("token", token, {
      httpOnly: true,   // JS se access nahi hoga (XSS protection)
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
    });

    if (wantsJson) {
      return res.status(200).json({ 
        success: true, 
        message: "Email verified successfully!",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        token
      });
    }

    return res.status(200).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #10b981;">Email Verified Successfully!</h1>
        <p>Thank you for verifying your email. You can now access all features.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      </div>
    `);
  } catch (error) {
    console.error("Verification Error:", error);
    if (wantsJson) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    return res.status(500).send("Internal server error");
  }
};

// ─── Logout ──────────────────────────────────────────────────
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─── Forgot Password ──────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Generate 6-digit Reset OTP
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes valid

    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send email
    await sendResetPasswordEmail(email, user.username, resetCode);

    return res.status(200).json({
      success: true,
      message: "Password reset verification code sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─── Reset Password ───────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code, and new password are required",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check code and expiry
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (new Date() > user.resetPasswordCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Secure the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, loginUser, verifyEmail, logoutUser, getMe, forgotPassword, resetPassword };