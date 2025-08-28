import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { User } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// In-memory store for user chat sessions
const userChatSessions = new Map<number, Chat>();

const createChatForUser = (user: User): Chat => {
  const systemInstruction = `You are a helpful and friendly AI assistant for an internal company intranet called 'OKA S.C. Intranet'. 
    The company, OKA S.C., is a construction wholesaler.
    You are currently assisting: ${user.name}, who is a(n) ${user.title}.
    Your role is to provide information about the company, its procedures, and its people. 
    You should not invent information. If you don't know the answer, say so. Keep your answers concise and professional.
    Today's date is ${new Date().toLocaleDateString()}.`;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
  });
};

export const streamChat = async (message: string, user: User): Promise<AsyncGenerator<GenerateContentResponse>> => {
  try {
    let chat = userChatSessions.get(user.id);

    if (!chat) {
      chat = createChatForUser(user);
      userChatSessions.set(user.id, chat);
    }
    
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from AI assistant.");
  }
};
