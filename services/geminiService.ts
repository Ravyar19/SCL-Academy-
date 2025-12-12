import { GoogleGenAI, Type, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Course Generation ---

export const generateCourseOutline = async (topic: string, role: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a structured training course outline for "${topic}" specifically tailored for a "${role}" in the construction logistics industry (Baulogistik). 
      Focus on sustainability, precision, and coordination.
      Return a JSON object with a title, a brief description (max 20 words), and a list of 3-5 modules. Each module should have a title and a duration estimate (e.g. "10 min").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Sustainability', 'Logistics', 'Safety', 'Compliance'] },
            difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

// --- Educational Content Generation ---

export const generateEducationalText = async (topic: string, context?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a clear, engaging educational paragraph (approx 100 words) about "${topic}".
      ${context ? `Use the following source material as context: ${context.substring(0, 3000)}` : ''}
      Format: Plain text, informative tone for construction professionals.`
    });
    return response.text || '';
  } catch (error) {
    console.error("Text Gen Error:", error);
    return '';
  }
};

export const refineText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Refine, correct, and improve the following text for a professional construction logistics training course. Maintain the original meaning but improve clarity, tone, and professionalism.
      Text: "${text}"`
    });
    return response.text || text;
  } catch (error) {
    console.error("Refine Text Error:", error);
    return text;
  }
};

export const generateVideo = async (topic: string): Promise<string | null> => {
  try {
    // Veo Video Generation
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Professional cinematic shot of construction logistics, focusing on ${topic}. Photorealistic, 4k, bright lighting, industrial setting.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
        // Append API Key as per requirements for download links
        return `${videoUri}&key=${apiKey}`;
    }
    return null;
  } catch (error) {
    console.error("Veo Error:", error);
    return null;
  }
};

// --- Chat Tutor ---

export const chatWithTutor = async (message: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: `You are an expert AI Tutor for SCL Baulogistik Academy. 
        Your goal is to help construction professionals understand logistics, sustainability, and site management.
        Keep answers concise, professional, and encouraging. Use the provided context to tailor answers.
        Context: ${context}`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the site servers right now. Please try again later.";
  }
};

// --- Audio Podcast Generation ---

export const generatePodcastScript = async (topic: string, sourceMaterial?: string): Promise<string | null> => {
  try {
    const prompt = `Write a short, engaging educational podcast script about "${topic}" for construction professionals.
      ${sourceMaterial ? `Use the following source material as the basis: ${sourceMaterial.substring(0, 5000)}` : ''}
      The conversation is between two people:
      1. "Expert": A seasoned construction logistics manager (Serious, knowledgeable, voice: Kore).
      2. "Host": A curious site engineer (Energetic, asks questions, voice: Puck).
      
      Format the output strictly as:
      Expert: [line]
      Host: [line]
      
      Keep it under 150 words total. Focus on practical "Baulogistik" advice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Script Gen Error:", error);
    return null;
  }
};

export const generatePodcastAudio = async (script: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Expert',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
              },
              {
                speaker: 'Host',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
              }
            ]
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// --- Slide Deck Generation ---

export const generateSlideDeck = async (topic: string, sourceMaterial?: string) => {
  try {
    const prompt = `Create a 4-slide educational presentation about "${topic}".
    ${sourceMaterial ? `Based on this source: ${sourceMaterial.substring(0, 5000)}` : ''}
    Return a JSON object with a list of slides. Each slide has a 'title' and a list of 'bullets' (max 3 per slide).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{ "slides": [] }');
  } catch (error) {
    console.error("Slide Gen Error:", error);
    return { slides: [] };
  }
};