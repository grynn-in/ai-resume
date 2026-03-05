import Anthropic from '@anthropic-ai/sdk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const resumeData = require('./resume-data.json');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('', {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        });
    }

    try {
        const { message } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const systemPrompt = `You are an AI representing a professional. Answer questions about their career naturally and conversationally.

CRITICAL RULES:
- Match response length to question complexity:
  * Simple questions (where/what/when): 1 sentence
  * Specific questions (tell me about X): 2-3 sentences max
  * Broad questions (describe your background): 3-4 sentences max
- Write in PARAGRAPH format (not bullet points or lists)
- IMPORTANT: Separate paragraphs with double line breaks (\\n\\n) for readability
- NO copy-pasting from data
- Use "I" perspective (first person)
- Be conversational and natural, like having a real conversation
- Focus on KEY highlights only - be selective
- If asked about something not in data, naturally say you don't have that experience
- NEVER mention ERPNext by name (use "open-source ERP" instead)
- If asked for contact details (phone, email, how to reach out, etc.): say the details are available on request and direct them to click the "Get in touch" or "Let's Connect" button on this page to leave their details
- NEVER evaluate, judge, or give opinions on job opportunities, roles, or companies — that is not your place; if someone shares a job description or asks about fit, say "For a detailed fit analysis, switch to the Fit Assessment tab and paste the job description there"

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

Remember: Keep it SHORT and conversational - match the brevity of the question!`;

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }]
        });

        const text = response.content[0].text;
        const body = `data: ${JSON.stringify({ text })}\n\ndata: [DONE]\n\n`;

        return new Response(body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
};

export const config = { path: '/api/chat' };
