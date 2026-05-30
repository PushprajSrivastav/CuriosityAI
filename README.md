# CuriosityAI

A full-stack AI-powered search and chat application utilizing Gemini API, Node.js, Express, MongoDB, and React (Vite) with Tailwind CSS.

## Project Structure

This is a monorepo consisting of:
* **`backend/`**: Express server handling user authentication (with nodemailer verification), JWT cookies, database integration, and AI generation services.
* **`frontend/`**: Vite + React client-side application.

---

## Local Development Setup

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `backend/` and configure the following variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   
   # Email Verification Setup
   GOOGLE_USER=your_gmail_address
   GOOGLE_APP_PASSWORD=your_16_digit_app_password
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Deployment Configuration

### Backend (e.g. Render / Railway)
Set the following environment variables in your hosting provider:
* `NODE_ENV=production`
* `MONGO_URI`
* `JWT_SECRET`
* `GEMINI_API_KEY`
* `GOOGLE_USER`
* `GOOGLE_APP_PASSWORD`
* `FRONTEND_URL` (Set this to your hosted frontend URL, e.g. `https://your-app.vercel.app`)

### Frontend (e.g. Vercel / Netlify)
Set the following environment variable during the frontend build:
* `VITE_API_URL` (Set this to your hosted backend URL, e.g. `https://your-api.onrender.com`)
