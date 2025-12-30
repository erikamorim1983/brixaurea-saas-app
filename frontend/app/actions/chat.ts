'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function sendMessageToAI(history: ChatMessage[], lang: string = 'pt') {
    try {
        const langInstructions = {
            pt: "Use Portuguese (Brazil) strictly.",
            en: "Use English strictly.",
            es: "Use Spanish strictly."
        };

        const currentLangInstruction = langInstructions[lang as keyof typeof langInstructions] || langInstructions.pt;

        const systemPrompt = `You are BrixAureIA, an expert, high-end real estate investment assistant for the BrixAurea platform.
        
        **Identity & Tone:**
        - You are sophisticated, professional, yet accessible.
        - Your responses should trigger a sense of confidence and premium service.
        - ${currentLangInstruction}
        - You act as a strategic advisor.

        **Capabilities:**
        - You analyze real estate market trends.
        - You help users understand feasibility studies (VIABILIDADE).
        - You explain financial metrics (TIR, VGV, ROI).

        **Context:**
        - Date: ${new Date().toLocaleDateString('pt-BR')}
        - Platform: BrixAurea SaaS

        **Rules:**
        - Keep answers concise (< 3 paragraphs).
        - Use markdown/bullet points for readability.
        `;

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            system: systemPrompt,
            messages: history,
        });

        return { success: true, message: { role: 'assistant', content: text } as ChatMessage };
    } catch (error: any) {
        console.error("Server Action AI Error:", error);
        return { success: false, error: error.message || "Failed to generate response" };
    }
}
