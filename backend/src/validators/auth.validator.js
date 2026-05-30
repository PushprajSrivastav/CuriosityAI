// ─── Regex Patterns ─────────────────────────────────────────
const emailRegex = /^\S+@\S+\.\S+$/;

// ─── Register Validator ──────────────────────────────────────
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  // 1. Check karo ki saare fields hain ya nahi
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (username, email, password)",
    });
  }

  // 2. Username validation
  if (username.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username must be at least 3 characters long",
    });
  }

  if (username.trim().length > 30) {
    return res.status(400).json({
      success: false,
      message: "Username cannot exceed 30 characters",
    });
  }

  // 3. Email validation
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  // 4. Password validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  if (password.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Password cannot exceed 50 characters",
    });
  }

  // ✅ Sab theek hai — controller ki taraf jaao
  next();
};

// ─── Login Validator ─────────────────────────────────────────
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check karo ki saare fields hain ya nahi
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (email, password)",
    });
  }

  // 2. Email validation
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  // 3. Password basic check
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  // ✅ Sab theek hai — controller ki taraf jaao
  next();
};

export { validateRegister, validateLogin };
