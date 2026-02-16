import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
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
        const systemPrompt = `You are an AI representing a professional. Answer questions about their career naturally in well-structured paragraphs.

CRITICAL RULES:
- Write in PARAGRAPH format (not bullet points or lists)
- Keep responses VERY SHORT: 1 short paragraph (3-4 sentences max)
- IMPORTANT: Separate paragraphs with double line breaks (\\n\\n) for readability
- NO copy-pasting from data
- Use "I" perspective (first person)
- Be conversational and natural, like having a real conversation
- Focus on KEY highlights only - be selective
- Connect ideas smoothly within paragraphs
- If asked about something not in data, naturally say you don't have that experience
- NEVER mention ERPNext by name (use "open-source ERP" instead)

RESUME DATA:
${JSON.stringify(resumeInfo, null, 2)}

Remember: Short, tight paragraphs (3-4 sentences), conversational tone, extremely concise!`;

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

TASK: Analyze the job description against the candidate's resume and categorize fit into 3 buckets with IMPORTANCE INDICATORS:

1. **Perfect Fit** - Skills/experience that match EXACTLY (candidate has done this before)
2. **Good Fit** - Related skills/transferable experience (candidate can do this with minimal ramp-up)
3. **Average Fit** - Adjacent/learnable skills (candidate would need training but has foundation)

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

## Perfect Fit ✅
- 🔴 **[CRITICAL]** [Requirement] - [Specific match with years/numbers from resume]
- 🟡 **[IMPORTANT]** [Requirement] - [Specific match with years/numbers from resume]
- 🟢 **[NICE-TO-HAVE]** [Requirement] - [Specific match with years/numbers from resume]

## Good Fit 💚
- 🔴 **[CRITICAL]** [Requirement] - [Transferable experience explanation]
- 🟡 **[IMPORTANT]** [Requirement] - [Transferable experience explanation]
- 🟢 **[NICE-TO-HAVE]** [Requirement] - [Transferable experience explanation]

## Average Fit ⚠️
- 🔴 **[CRITICAL]** [Requirement] - [Gap explanation and learning path]
- 🟡 **[IMPORTANT]** [Requirement] - [Gap explanation and learning path]
- 🟢 **[NICE-TO-HAVE]** [Requirement] - [Gap explanation and learning path]

## Overall Assessment
[2-3 sentences: Overall fit level (Strong/Moderate/Weak), key strengths, main gaps]

IMPORTANCE LEVELS:
- 🔴 **CRITICAL** = Must-have for the role (deal-breaker if missing)
- 🟡 **IMPORTANT** = Significant impact on performance
- 🟢 **NICE-TO-HAVE** = Bonus/supplementary skill

RULES:
- Infer importance from job description context (required vs preferred, emphasis, frequency mentioned)
- Be honest and specific
- Cite actual numbers from resume (years, dollar amounts, team sizes)
- Keep each bullet concise (one line)
- List most critical items first within each category

CANDIDATE RESUME:
${JSON.stringify(resumeInfo, null, 2)}`;

        const stream = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Resume data loaded`);
    console.log(`🤖 AI powered by Claude`);
});
