import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { testAI } from "./src/services/ai.services.js";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    }); 
});

testAI();