
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Exercise, ExerciseType, Difficulty, GrammarTopic } from "../types";

// Always initialize GoogleGenAI with a named parameter using process.env.API_KEY.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExercises = async (topic: GrammarTopic, difficulty: Difficulty): Promise<Exercise[]> => {
  const ai = getAI();
  const prompt = `You are an expert English Grammar Tutor. Generate exactly 5 high-quality exercises for the topic: "${topic.name}" at a ${difficulty} level.
  
  CRITICAL REQUIREMENTS:
  1. For MULTIPLE_CHOICE: You MUST provide exactly 4 distinct options in the 'options' array.
  2. For SCRAMBLED_SENTENCE: You MUST provide the individual words of the correct answer in random order in the 'options' array.
  3. Focus on common ESL (English as a Second Language) mistakes for this topic.
  4. Explanations should be pedagogical, clear, and encouraging.
  
  Format the output as a JSON array of exercise objects.`;

  // Use gemini-3-pro-preview for complex pedagogical content generation.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { 
              type: Type.STRING, 
              enum: [
                ExerciseType.MULTIPLE_CHOICE, 
                ExerciseType.FILL_IN_BLANK, 
                ExerciseType.SCRAMBLED_SENTENCE, 
                ExerciseType.TRANSLATION
              ] 
            },
            question: { type: Type.STRING, description: 'Instructions for the student' },
            targetSentence: { type: Type.STRING, description: 'The context sentence or sentence to complete' },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'List of choices for MULTIPLE_CHOICE or scrambled words for SCRAMBLED_SENTENCE'
            },
            answer: { type: Type.STRING, description: 'The correct full sentence or word' },
            explanation: { type: Type.STRING, description: 'The grammar rule explanation' }
          },
          required: ['id', 'type', 'question', 'answer', 'explanation', 'options']
        }
      }
    }
  });

  try {
    const jsonStr = (response.text || "").trim();
    return JSON.parse(jsonStr) as Exercise[];
  } catch (error) {
    console.error("Failed to parse exercises:", error);
    throw new Error("AI generated invalid exercise format. Please try again.");
  }
};

export const speakText = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly and naturally for an English learner: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const bytes = decode(base64Audio);
    const buffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  }
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
