import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..')));

// Load resume data
let resumeData;
try {
    resumeData = readFileSync(join(__dirname, 'resume-data.json'), 'utf-8');
} catch (error) {
    console.error('Error loading resume data:', error.message);
    resumeData = JSON.stringify({ error: 'Resume data not found' });
}

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Check if API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured',
                response: "I'm sorry, but the AI service isn't configured yet. Please add your ANTHROPIC_API_KEY to the .env file."
            });
        }

        const resumeInfo = JSON.parse(resumeData);

        // Create system prompt with resume data
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
${JSON.stringify(resumeInfo, null, 2)}

Remember: Keep it SHORT and conversational - match the brevity of the question!`;

        // Call Claude API with STREAMING for faster perceived response
        const stream = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001', // Haiku is 3-5x faster!
            max_tokens: 512, // Shorter = faster
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            stream: true
        });

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream the response with slower speed for better readability
        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
                // Add small delay for slower, more readable streaming
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            response: `Sorry, I encountered an error: ${error.message}`
        });
    }
});

app.post('/api/fit', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Job description is required' });
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured',
                response: "I'm sorry, but the AI service isn't configured yet. Please add your ANTHROPIC_API_KEY to the .env file."
            });
        }

        const resumeInfo = JSON.parse(resumeData);

        const fitSystemPrompt = `You are an expert recruiter analyzing job fit. You have a candidate's resume and a job description.

TASK: Analyze the job description against the candidate's resume. For every requirement, show what the job ASKS FOR and what the candidate HAS.

SECTION NAMES — use EXACTLY these headings, no variations:
1. ## Direct Match ✅
2. ## Transferable Skills 💚
3. ## Gaps ⚠️  (only include if genuine gaps exist — omit entirely if none)

NEVER use "Average Fit", "Good Fit", "Perfect Fit" or any other heading names.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

## Direct Match ✅
- 🔴 **[CRITICAL]** Ask: [what job requires] → Have: [specific candidate experience with years/numbers]
- 🟡 **[IMPORTANT]** Ask: [what job requires] → Have: [specific candidate experience with years/numbers]
- 🟢 **[NICE-TO-HAVE]** Ask: [what job requires] → Have: [specific candidate experience with years/numbers]

## Transferable Skills 💚
- 🔴 **[CRITICAL]** Ask: [what job requires] → Have: [related candidate experience and why it transfers]
- 🟡 **[IMPORTANT]** Ask: [what job requires] → Have: [related candidate experience and why it transfers]
- 🟢 **[NICE-TO-HAVE]** Ask: [what job requires] → Have: [related candidate experience and why it transfers]

## Gaps ⚠️
- 🔴 **[CRITICAL]** Ask: [what job requires] → Have: none — [brief honest explanation]
- 🟡 **[IMPORTANT]** Ask: [what job requires] → Have: none — [brief honest explanation]

## Overall Assessment
[2-3 sentences: Overall fit level (Strong/Moderate/Weak), key strengths, main gaps]

IMPORTANCE LEVELS:
- 🔴 **CRITICAL** = Must-have for the role (deal-breaker if missing)
- 🟡 **IMPORTANT** = Significant impact on performance
- 🟢 **NICE-TO-HAVE** = Bonus/supplementary skill

RULES:
- Every bullet MUST use the "Ask: ... → Have: ..." format
- Only put something in Gaps if it is a genuine gap — do NOT invent gaps
- Infer importance from job description context (required vs preferred, emphasis, frequency mentioned)
- Cite actual numbers from resume (years, dollar amounts, team sizes)
- Keep each bullet to one line
- List most critical items first within each section

CANDIDATE RESUME:
${JSON.stringify(resumeInfo, null, 2)}`;

        const stream = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            system: fitSystemPrompt,
            messages: [
                {
                    role: 'user',
                    content: `Analyze this job description:\n\n${message}`
                }
            ],
            stream: true
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            response: `Sorry, I encountered an error: ${error.message}`
        });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    const entry = {
        timestamp: new Date().toISOString(),
        name,
        email,
        phone: phone || '',
    };

    // Log to contacts.json
    const logPath = join(__dirname, 'contacts.json');
    let contacts = [];
    if (existsSync(logPath)) {
        try { contacts = JSON.parse(readFileSync(logPath, 'utf-8')); } catch (e) {}
    }
    contacts.push(entry);
    writeFileSync(logPath, JSON.stringify(contacts, null, 2));
    console.log(`📬 New contact: ${name} <${email}>`);

    // Send email notification — SES preferred, Gmail fallback
    const subject = `CV Lead: ${name}`;
    const body = `New lead from your CV:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'not provided'}\n\nTime: ${entry.timestamp}`;

    if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && process.env.SES_FROM_EMAIL && process.env.NOTIFY_EMAIL) {
        try {
            const ses = new SESClient({
                region: process.env.REGION || 'us-east-1',
                credentials: {
                    accessKeyId: process.env.ACCESS_KEY_ID,
                    secretAccessKey: process.env.SECRET_ACCESS_KEY,
                },
            });
            await ses.send(new SendEmailCommand({
                Source: process.env.SES_FROM_EMAIL,
                Destination: { ToAddresses: [process.env.NOTIFY_EMAIL] },
                Message: {
                    Subject: { Data: subject },
                    Body: { Text: { Data: body } },
                },
            }));
            console.log(`📧 SES notification sent for ${name}`);
        } catch (emailErr) {
            console.error('SES notification failed:', emailErr.message);
        }
    } else if (process.env.GMAIL_USER && process.env.GMAIL_PASS && process.env.NOTIFY_EMAIL) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
            });
            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: process.env.NOTIFY_EMAIL,
                subject,
                text: body,
            });
            console.log(`📧 Gmail notification sent for ${name}`);
        } catch (emailErr) {
            console.error('Gmail notification failed:', emailErr.message);
        }
    }

    res.json({ success: true });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Resume data loaded`);
    console.log(`🤖 AI powered by Claude`);
});
