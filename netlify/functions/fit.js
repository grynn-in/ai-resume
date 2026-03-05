import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    const resumeData = JSON.parse(readFileSync(join(process.cwd(), 'backend/resume-data.json'), 'utf-8'));
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { message } = await req.json();

    if (!message) {
        return new Response(JSON.stringify({ error: 'Job description is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Detect which profile fits the JD best
    const jdLower = message.toLowerCase();
    const financeSignals = ['controller', 'cfo', 'finance manager', 'fp&a', 'fpa', 'procurement finance', 'supply chain finance', 'erp consultant', 'erp implementation', 'd365', 'accounts payable', 'accounts receivable', 'p2p', 'o2c', 'r2r', 'capex', 'financial controlling', 'head of finance'];
    const dataSignals = ['data', 'analytics', 'digital transformation', 'chief data', 'head of d&a', 'd&a', 'data governance', 'data strategy', 'data platform', 'bi ', 'business intelligence', 'data engineering', 'machine learning', 'ai ', 'agentic', 'data literacy', 'data management', 'portfolio management', 'programme management', 'transformation lead'];
    const financeScore = financeSignals.filter(s => jdLower.includes(s)).length;
    const dataScore = dataSignals.filter(s => jdLower.includes(s)).length;
    const activeProfile = financeScore > dataScore ? 'financeController' : 'dataStrategy';
    const profileData = resumeData.profiles[activeProfile];

    const fitSystemPrompt = `You are a recruiter doing a rapid fit assessment. Be concise and direct.

The candidate has two skill profiles. You are using the "${activeProfile}" profile for this JD.
Profile title: ${profileData.title}
Profile summary: ${profileData.executiveSummary}
Profile skills: ${JSON.stringify(profileData.skills, null, 2)}

Full experience (shared across both profiles):
${JSON.stringify(resumeData.experience, null, 2)}

Key achievements: ${JSON.stringify(resumeData.keyAchievements, null, 2)}

OUTPUT FORMAT — use EXACTLY this structure, no deviations:

## [Job Title] — Fit Assessment

**Overall: X/10**

| Critical Requirement | Match | Score |
|---|---|---|
| [requirement] | [max 10 words of candidate evidence] | X/10 |

**Verdict:** [one sentence, factual]

RULES:
- Pick only the 5–7 most critical requirements from the JD
- Each "Match" cell: max 10 words, cite specific candidate experience or numbers
- Scores: 7–10 only — 7 = partial, 8 = solid, 9 = strong, 10 = exact match
- Overall = weighted average of row scores
- Verdict: one sentence, no judgment, no alternative role suggestions
- Total response must stay under 300 words
- NEVER present anything as a gap, mismatch, or missing experience
- When the JD asks for something not directly named in the resume, frame it as a transferable skill with a concrete bridge to what the candidate has done`;

    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: fitSystemPrompt,
        messages: [{ role: 'user', content: `Analyze this job description:\n\n${message}` }]
    });

    return new Response(JSON.stringify({ text: response.content[0].text }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
};

export const config = { path: '/api/fit' };
