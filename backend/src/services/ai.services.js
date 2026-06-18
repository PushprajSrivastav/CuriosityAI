import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-flash", // Using 1.5-flash which has 1,500 requests/day free tier instead of 2.5's 20 requests/day
});

export async function testAI() {
    console.log("🚀 Testing AI Service...");
    try {
        const response = await model.invoke("what is the capital of rajasthan?");
        console.log("🤖 AI Response:", response.content);
    } catch (error) {
        console.error("❌ AI Service Error:", error.message);
    }
}

export async function getAIChatResponse(prompt) {
    const response = await model.invoke(prompt);
    return response.content;
}
