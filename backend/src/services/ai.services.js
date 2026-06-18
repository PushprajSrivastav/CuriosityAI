import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
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
