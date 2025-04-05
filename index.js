require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// Google AI API 
console.log("Initializing Google AI with API key:", process.env.GOOGLE_API_KEY ? "Present" : "Missing");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const REJECTION_MESSAGE = "I am here only to create bedtime stories. Ask me for a story!";

// Function to generate story
async function generateStory(userInput) {
    try {
        console.log("Creating model instance...");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro-latest",
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            }
        });
        
        console.log("Starting chat session...");
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a creative storyteller who specializes in bedtime stories." }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I will help create engaging and imaginative bedtime stories." }],
                },
            ],
        });

        console.log("Sending message to chat...");
        const result = await chat.sendMessage(userInput);
        console.log("Getting response...");
        const response = await result.response;
        console.log("Response received:", response.text());
        return response.text();
    } catch (error) {
        console.error("Detailed error:", {
            name: error.name,
            message: error.message,
            code: error.code,
            status: error.status,
            stack: error.stack,
            response: error.response?.data
        });
        return "Sorry, I couldn't generate a story at this time. Please check the server logs for details.";
    }
}

// API Endpoint
app.post("/story", async (req, res) => {
    console.log("Received request:", req.body);
    const userInput = req.body.message?.trim().toLowerCase();

    if (!userInput) {
        console.log("No user input provided");
        return res.json({ response: REJECTION_MESSAGE });
    }

    
    if (userInput.includes("story") || userInput.includes("bedtime")) {
        console.log("Generating story for input:", userInput);
        const story = await generateStory(userInput);
        return res.json({ response: story });
    }

    // Reject if the question is not about stories 
    console.log("Rejecting non-story query:", userInput);
    return res.json({ response: REJECTION_MESSAGE });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Storytelling Chatbot running on port ${PORT}`);
});
