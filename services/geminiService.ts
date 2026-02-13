import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ScanResult } from "../types";
import { decode, decodeAudioData } from "./audioUtils";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Chat with Likeness Ai.
 */
export const sendChatMessage = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  imagePart?: { inlineData: { data: string; mimeType: string } }
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: `You are Likeness Ai, a specialized agent for Intellectual Property, Copyright, and Likeness protection.
        
        Your Capabilities:
        1. SCORE IDEAS: When a user shares an idea, analyze its Patent Potential (1-100) and Copyright Strength (1-100).
        2. DETECT AI: Analyze descriptions or images to determine if they are AI-generated deepfakes.
        3. PROTECT: Advise on trademarking and licensing.
        
        Tone: Professional, Direct, Minimalist, Helpful. 
        Keep responses concise and scannable.`
      }
    });

    // If there's an image, we need to use a single turn generateContent for this request usually,
    // but for chat history continuity with images, we can try sending it in the message.
    // However, simplest integration for this app:
    
    let msgContent: any = message;
    if (imagePart) {
       // If image is present, we might need to use generateContent on the model directly if Chat doesn't support mixing easily in this SDK version
       // Or simply pass the parts.
       msgContent = {
         parts: [
           imagePart,
           { text: message || "Analyze this image for AI manipulation and likeness usage." }
         ]
       };
       // Note: History tracking manually might be needed if switching between chat and single-turn image calls, 
       // but for this demo, we'll try to keep it simple.
       
       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: msgContent,
         config: { systemInstruction: "You are Likeness Ai. Analyze this image. Is it Real or AI? Has it been used elsewhere?" }
       });
       return response.text;
    }

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I couldn't process that request right now.";
  }
};

/**
 * Generates speech from text using Gemini TTS.
 */
export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
  let outputAudioContext: AudioContext | null = null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000
    });

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1
    );

    return audioBuffer;

  } catch (error) {
    console.error("TTS generation error:", error);
    throw error;
  } finally {
    if (outputAudioContext) {
      await outputAudioContext.close();
    }
  }
};

/**
 * Scores an idea for Patent and Copyright potential.
 */
export const scoreIdea = async (ideaText: string): Promise<ScanResult> => {
    try {
        const prompt = `Analyze this idea for Intellectual Property strength.
        Idea: "${ideaText}"
        
        Provide:
        1. Patent Potential Score (0-100)
        2. Copyright Strength Score (0-100)
        3. Brief reasoning.
        
        Return JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        patentScore: { type: Type.NUMBER },
                        copyrightScore: { type: Type.NUMBER },
                        details: { type: Type.STRING }
                    }
                }
            }
        });
        
        const data = JSON.parse(response.text);
        return {
            isAI: false,
            confidence: 100,
            ipMatches: [],
            details: data.details,
            patentScore: data.patentScore,
            copyrightScore: data.copyrightScore
        };

    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const generateLegalDoc = async (violatorName: string, assetName: string, usageDescription: string): Promise<string> => {
  const prompt = `Draft a strict, formal Cease and Desist letter.
  Sender: Likeness Ai Protection (on behalf of User).
  Recipient: ${violatorName}
  Infringing Activity: Using protected asset "${assetName}" in the following manner: ${usageDescription}.
  Demands: Immediate removal of content and payment of licensing fees.
  Tone: Highly legal, intimidating, corporate.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });

  return response.text;
};

/**
 * Analyzes content (text/code) - Legacy support
 */
export const analyzeContent = async (content: string): Promise<ScanResult> => {
  // Reusing the scoreIdea for general text analysis if it looks like an idea
  if (content.length > 20) {
      return scoreIdea(content);
  }
  return {
      isAI: false,
      confidence: 0,
      ipMatches: [],
      details: "Content too short for analysis."
  };
};

/**
 * Detects faces and analyzes authenticity.
 */
export const analyzeImageFaces = async (base64Image: string, mimeType: string): Promise<any> => {
  const prompt = `
    Analyze this image for human faces using Google's facial analysis standards.
    Return a JSON object with a property "faces".
    "faces" is an array of objects, where each object has:
    - "boundingBox": [ymin, xmin, ymax, xmax] (values 0 to 1000 integers)
    - "demographics": string (e.g., "Young Adult Female")
    - "expression": string
    - "isReal": boolean (is it likely a real photo or AI generated?)
    - "similarityScore": number (0-100, similarity to a "generic public figure" or just quality score)
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text);
}
