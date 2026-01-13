
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Corrected initialization to strictly follow @google/genai coding guidelines
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const checkAssignmentQuality = async (content: string, subject: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Review the following academic submission for the subject "${subject}". Provide a quality score (0-100) and brief feedback.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "A quality score from 0 to 100" },
            feedback: { type: Type.STRING, description: "Constructive feedback on the work" },
            plagiarismLikelihood: { type: Type.STRING, description: "Estimated risk level" }
          },
          required: ["score", "feedback", "plagiarismLikelihood"]
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Quality check failed:", error);
    return { score: 0, feedback: "Unable to process review at this time.", plagiarismLikelihood: "Unknown" };
  }
};

export const generateChatResponse = async (
  assignmentTitle: string,
  subject: string,
  userRole: string,
  lastMessage: string
) => {
  try {
    const counterpartRole = userRole === 'STUDENT' ? 'Writer' : 'Student';
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a ${counterpartRole} on an academic assistance platform called Paperly. 
      You are discussing the project "${assignmentTitle}" (Subject: ${subject}).
      The ${userRole} just said: "${lastMessage}".
      Provide a very short (max 2 sentences), professional, and relevant response. 
      Do not use placeholder names like [Name]. Be concise and natural.`,
    });
    return response.text || "I've received your message. Let's discuss this further.";
  } catch (error) {
    console.error("AI Chat response failed:", error);
    return "Noted. I'll look into it.";
  }
};
