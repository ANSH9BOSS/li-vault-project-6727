
import { GoogleGenAI } from "@google/genai";

export async function runCodeInAI(code: string, language: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an intelligent code execution simulator.
    Your task is to analyze the provided code and language, then output what the console or terminal would show if this code was executed perfectly.
    - If there are errors, describe them clearly.
    - If there is output (print, console.log, etc), show exactly that output.
    - Format your response as a clean terminal output.
    - Be brief and precise.
  `;

  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning and code execution simulation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Language: ${language}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    return response.text || "Execution finished with no output.";
  } catch (error) {
    console.error('Gemini error:', error);
    return "Error: Could not reach the AI simulation engine.";
  }
}
