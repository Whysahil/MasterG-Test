import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize AI Client
// Use optional chaining (?.) for import.meta.env to prevent crashes in some environments.
// @ts-ignore
const API_KEY = import.meta.env?.VITE_API_KEY || '';

// Initialize client only if API Key exists to prevent "API key must be set" error
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.warn("Failed to initialize GoogleGenAI client:", error);
  }
}

// CACHE SIMULATION (Session Storage)
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

    // 2. Fallback for demo if no client or key
    if (!ai) {
      return `**[DEMO MODE: AI KEY NOT FOUND]**\n\nTo see real AI responses, please configure VITE_API_KEY in your Vercel Environment Variables.\n\n**Simulated Explanation:**\n\n1. **Concept**: The question asks about ${subject}.\n2. **Solution**: The correct logic involves applying the basic formula.\n3. **Shortcut**: Use the elimination method.`;
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
     if (!ai) return "Great effort! Focus on your accuracy and review the subjects where you lost marks.";
     return "Keep practicing!";
  },

  /**
   * Generates real exam questions using the Senior Exam Setter Persona.
   */
  generateMockQuestions: async (subject: string, count: number, examType: string = 'SSC CGL'): Promise<any[]> => {
    if (!ai) return [];

    const prompt = `
You are a senior Government Exam Paper Setter, Exam Analyst, and AI Question Generation Expert with deep knowledge of Indian competitive exams.

Your task is to generate ${count} HIGH-QUALITY, REALISTIC, EXAM-LEVEL MCQ QUESTIONS.

================================================
EXAM CONTEXT
================================================
Exam Type: ${examType}
Subject: ${subject}

================================================
STRICT GENERATION RULES
================================================
1. GENERATE ONLY questions that have been asked before (PYQ) OR expected questions based on trends.
2. NO generic, instructional, or dummy questions.
3. Questions must be indistinguishable from real government exam questions.
4. If Subject = Quantitative Aptitude, include values that are calculation-friendly but tricky.
5. If Subject = General Awareness, focus on Static GK or Current Affairs (last 1-2 years).

================================================
OUTPUT FORMAT (JSON)
================================================
Return a JSON Array. Each object must have:
- questionText: The exact exam-style question string.
- options: An array of exactly 4 strings.
- correctOptionIndex: Integer (0-3).
- explanation: A detailed explanation including the 'Question Source' (e.g., 'Previous Year Question (SSC CGL 2022)' or 'Expected Question based on trend').
- subject: The specific topic (e.g., 'Polity', 'Profit & Loss').
- difficulty: One of 'EASY', 'MEDIUM', 'HARD'.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                subject: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ['EASY', 'MEDIUM', 'HARD'] }
              }
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
      return [];
    } catch (e) {
      console.error("Failed to generate questions", e);
      return [];
    }
  },
  
  hasApiKey: () => !!API_KEY
};