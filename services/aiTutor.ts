import { GoogleGenAI } from "@google/genai";

// Initialize AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// CACHE SIMULATION (Session Storage)
// In a real app, this would be Redis or a Database Table 'ai_explanations_cache'
const getCachedExplanation = (key: string) => sessionStorage.getItem(`ai_cache_${key}`);
const setCachedExplanation = (key: string, value: string) => sessionStorage.setItem(`ai_cache_${key}`, value);

export const aiTutorService = {
  /**
   * Generates a detailed, exam-oriented explanation for a wrong answer.
   */
  getExplanation: async (
    questionText: string,
    options: { id: string, text: string, isCorrect: boolean }[],
    userSelectedId: string | null,
    subject: string
  ): Promise<string> => {
    
    // 1. Check Cache
    const cacheKey = btoa(encodeURIComponent(questionText.substring(0, 50) + userSelectedId));
    const cached = getCachedExplanation(cacheKey);
    if (cached) return cached;

    // 2. Fallback for demo if no key
    if (!process.env.API_KEY) {
      return `**[DEMO MODE: AI KEY NOT FOUND]**\n\nTo see real AI responses, please configure API_KEY in your environment variables.\n\n**Simulated Explanation:**\n\n1. **Concept**: The question asks about ${subject}.\n2. **Solution**: The correct logic involves applying the basic formula.\n3. **Shortcut**: Use the elimination method.`;
    }

    const correctOption = options.find(o => o.isCorrect);
    const userOption = options.find(o => o.id === userSelectedId);

    const prompt = `
      You are "MasterG", a top-tier faculty for Indian Competitive Exams (SSC CGL, SBI PO, UPSC).
      
      **Student Context**:
      - Subject: ${subject}
      - Question: "${questionText}"
      - Options: ${options.map(o => `${o.text} ${o.isCorrect ? '(Correct)' : ''}`).join(', ')}
      - Student's Answer: "${userOption ? userOption.text : 'Skipped'}" (Wrong)
      
      **Goal**: Explain the solution in **HINGLISH** (Hindi + English mix) so it feels like a friendly teacher explaining in a classroom.
      
      **Output Format (Markdown)**:
      1. 🧠 **Concept**: Explain the underlying theory briefly.
      2. 📝 **Detailed Solution**: Step-by-step calculation or logic.
      3. ⚡ **MasterG Shortcut**: The "Exam Trick" to solve this in 10 seconds (e.g., Option Elimination, Digital Sum, Root Word).
      4. 💡 **Pro Tip**: A memory aid or mnemonic.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: { temperature: 0.7 }
      });
      
      const text = response.text || "Sorry, I couldn't generate an explanation right now.";
      
      // 3. Save to Cache
      setCachedExplanation(cacheKey, text);
      return text;

    } catch (error) {
      console.error("AI Generation Error:", error);
      return "⚠️ **AI Network Error**: Unable to connect to the MasterG AI Tutor. Please try again later.";
    }
  },

  getAttemptAnalysis: async (testTitle: string, score: number, totalMarks: number, accuracy: number, weakTopics: string[]): Promise<string> => {
     if (!process.env.API_KEY) return "Great effort! Focus on your accuracy and review the subjects where you lost marks.";
     // ... Implementation ...
     return "Keep practicing!";
  }
};