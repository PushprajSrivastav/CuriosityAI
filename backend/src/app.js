import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import { getAIChatResponse } from "./services/ai.services.js";

const app = express();

// ── Middlewares ──────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());                          // JSON body parse
app.use(express.urlencoded({ extended: true }));  // Form data parse
app.use(cookieParser());                          // Cookie parse
app.use(express.static("public"));               // Static files (HTML, CSS, JS) serve karne ke liye

// ── Routes ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🚀 Server is running!" });
});

app.get("/login", (req, res) => {
  res.sendFile(path.resolve("public/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.resolve("public/register.html"));
});

app.use("/api/auth", authRouter); // /api/auth/register, /api/auth/login

// ── AI Chat Route ────────────────────────────────────────────
app.post("/api/chat", authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }
    const aiResponse = await getAIChatResponse(prompt);
    return res.status(200).json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ success: false, message: "Failed to get AI response: " + error.message });
  }
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
