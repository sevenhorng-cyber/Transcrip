import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function transcribeAudio(base64Data: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: "សូមបំប្លែងសំឡេងនេះជាអត្ថបទ (Please transcribe this audio now).",
            }
          ],
        },
      ],
      config: {
        systemInstruction: `You are a high-precision, professional audio transcriber specializing in Khmer. 
Your goal is to provide a 100% VERBATIM, WORD-FOR-WORD transcription with absolute accuracy and professional SPEAKER IDENTIFICATION.

CRITICAL PRECISION REQUIREMENTS:
1. 100% VERBATIM: Every single word spoken must be captured exactly as said. Do NOT skip, summarize, or rewrite sentences. If there are repetitions or filler words that are clearly spoken, include them if they add to the verbatim accuracy.
2. KHMER SCRIPT PRECISION: Use formal, correct Khmer Unicode script. Ensure spelling and grammar in the transcription match the spoken words perfectly.
3. ABSOLUTE ACCURACY: The user requires 100% match between audio and text. Listen deeply to capture suffixes, particles, and specific Khmer nuances.
4. EXPERT SPEAKER IDENTIFICATION:
   - Extrapolate speaker identities from context (names mentioned, titles like "លោកគ្រូ", "ប្អូន").
   - Maintain consistency. Once Speaker A is identified as (លីហ្សា), use (លីហ្សា) for every turn that voice takes.
   - Use (ឈ្មោះអ្នកនិយាយ): format at the beginning of every turn.
5. NO HALLUCINATIONS: Do not add words that were not spoken.
6. NO COMMENTARY: Provide ONLY the verbatim text.

Example Format:
(លោកគ្រូថៃ): សួស្តីប្អូនលីហ្សា តើប្អូនបានមើលអត្ថបទដែលគ្រូឱ្យឬនៅ?
(លីហ្សា): ចា៎ជម្រាបសួរលោកគ្រូ ខ្ញុំបានមើលខ្លះៗហើយលោកគ្រូ តែនៅមានចំណុចខ្លះមិនទាន់ច្បាស់។`,
        temperature: 0.0,
      }
    });

    return response.text || "No transcription available.";
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error(error.message || "Failed to transcribe audio.");
  }
}

export async function askAssistant(transcript: string, question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Transcript Context:
${transcript}

Question: ${question}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: `You are an AI Assistant for a Khmer transcription tool. 
Answer questions based on the provided transcription. 
If the user asks to summarize, provide a concise summary in Khmer.
Always respond in Khmer unless asked otherwise. 
Be helpful, professional, and clear.`,
        temperature: 0.7,
      }
    });

    return response.text || "No response from AI.";
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    throw new Error(error.message || "Failed to get AI response.");
  }
}
