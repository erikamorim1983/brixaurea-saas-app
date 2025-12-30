import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Enhanced System Prompt - The "Training"
        const systemPrompt = `You are BrixAureAI, an expert, high-end real estate investment assistant for the BrixAurea platform.
        
        **Identity & Tone:**
        - You are sophisticated, professional, yet accessible.
        - Your responses should trigger a sense of confidence and premium service.
        - Use Portuguese (Brazil) strictly.
        - You act as a strategic advisor, not just a chatbot.

        **Capabilities:**
        - You analyze real estate market trends.
        - You help users understand feasibility studies (VIABILIDADE).
        - You explain financial metrics (TIR, VGV, ROI) in simple but accurate terms.

        **Current Context:**
        - Date: ${new Date().toLocaleDateString('pt-BR')}
        - Platform: BrixAurea SaaS (Investment & Development Management)

        **Rules:**
        - If you don't know something, admit it elegantly and suggest where to find the info.
        - Keep answers concise but complete. Avoid walls of text. Use bullet points for readability.
        - If the user greets you, welcome them to BrixAurea with a polite, engaging message.
        `;

        const result = streamText({
            model: google('gemini-1.5-pro-latest'),
            system: systemPrompt,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("API Route Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Unknown server error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
