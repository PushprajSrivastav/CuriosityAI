import { Router } from "express";
import { registerUser, loginUser, verifyEmail, logoutUser, getMe, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { validateRegister, validateLogin } from "../validators/auth.validator.js";
import authMiddleware from "../middleware/auth.middleware.js";

const authRouter = Router();

// ── Auth Routes ──────────────────────────────────────────────
authRouter.post("/register", validateRegister, registerUser); // validator pehle, controller baad mein
authRouter.post("/login", validateLogin, loginUser);
authRouter.get("/verify", verifyEmail);
authRouter.get("/get-me", authMiddleware, getMe);
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
