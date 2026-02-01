import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize AI Client
// @ts-ignore
const API_KEY = import.meta.env?.VITE_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.warn("Failed to initialize GoogleGenAI client:", error);
  }
}

// CACHE SIMULATION
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

    // 2. Fallback
    if (!ai) return "**AI unavailable. Please check your API Key.**";

    const correctOption = options.find(o => o.isCorrect);
    const userOption = options.find(o => o.id === userSelectedId);

    const prompt = `
      You are "MasterG", India's top Faculty for Government Exams.
      
      **Context**:
      - Subject: ${subject}
      - Question: "${questionText}"
      - Options: ${options.map(o => `${o.text} ${o.isCorrect ? '(Correct)' : ''}`).join(', ')}
      - Student's Wrong Answer: "${userOption ? userOption.text : 'Skipped'}"
      
      **Task**: Explain the solution in **Hinglish** (Hindi+English mix).
      **Format**:
      1. 🧠 **Concept**: The core logic.
      2. 📝 **Solution**: Step-by-step.
      3. ⚡ **Exam Trick**: Shortest method.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: { temperature: 0.7 }
      });
      const text = response.text || "Explanation not generated.";
      setCachedExplanation(cacheKey, text);
      return text;
    } catch (error) {
      return "⚠️ Network Error during AI Explanation.";
    }
  },

  getAttemptAnalysis: async (testTitle: string, score: number, totalMarks: number, accuracy: number, weakTopics: string[]): Promise<string> => {
     if (!ai) return "Great effort! Focus on your accuracy.";
     return "Keep practicing!";
  },

  /**
   * Generates REAL EXAM QUESTIONS based on strict Gov Exam Syllabus.
   */
  generateMockQuestions: async (context: string, count: number, examCategory: string): Promise<any[]> => {
    if (!ai) return [];

    const prompt = `
You are a Senior Government Exam Paper Setter (15+ Years Experience).
Your task is to generate ${count} REALISTIC MCQ QUESTIONS for:
**Exam**: ${examCategory}
**Context/Topic**: ${context}

================================================
CRITICAL RULES (STRICT ADHERENCE REQUIRED)
================================================
1. **NO FAKE QUESTIONS**: Generate ONLY questions that follow the exact pattern of previous years (PYQ).
2. **SOURCE ATTRIBUTION**: In the explanation, you MUST explicitly state if this is a "Previous Year Question" (with Year) or an "Expected Question" based on trends.
3. **DIFFICULTY**: Mix of Easy (30%), Moderate (50%), Hard (20%).
4. **FORMAT**: Strict JSON.
5. **LANGUAGE**: Professional Exam English.

================================================
OUTPUT SCHEMA (JSON Array)
================================================
[
  {
    "questionText": "Exact Question String",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0, (0-3)
    "explanation": "Detailed solution + Source: [SSC CGL 2022 / Expected]",
    "subject": "Topic Name (e.g. Algebra, Polity)",
    "difficulty": "EASY" | "MEDIUM" | "HARD"
  }
]
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
      console.error("AI Question Generation Failed", e);
      return [];
    }
  },
  
  hasApiKey: () => !!API_KEY
};