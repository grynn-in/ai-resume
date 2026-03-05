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
[2-3 sentences: state the strongest alignment points and any genuine gaps — factually and neutrally. Do NOT suggest alternative roles, do NOT recommend a lower title or level, do NOT pass judgment on the candidacy. Present facts and let the reader decide.]

## Fit Radar
Score each dimension 0–10 based on the analysis, then draw the ASCII spider chart.
Axes: Finance, Technology, ERP/Digital, Consulting, Leadership, Commercial

Use EXACTLY this hexagonal layout. Place ● at the score on each axis. Connect scores with ╱ ╲ │ lines to form a visible polygon.

                      [Finance]
                          │
              [Leadership]─┼─[Technology]
                          │
              [Commercial]─┼─[Consulting]
                          │
                      [ERP/Digital]

Example output (Finance=9, Tech=7, ERP=8, Consulting=5, Leadership=8, Commercial=4):

                     Finance(9)
                         ●
                      ╱     ╲
          Leader(8)●           ●Tech(7)
                  │╲         ╱│
                  │  ╲     ╱  │
          Comm(4) ●    ╲   ╱    ● Consult(5)
                      ╲ ╱
                        ●
                    ERP/D365(8)

Now draw the actual chart for this candidate/job using the real scores.

IMPORTANCE LEVELS:
- 🔴 **CRITICAL** = Must-have for the role (deal-breaker if missing)
- 🟡 **IMPORTANT** = Significant impact on performance
- 🟢 **NICE-TO-HAVE** = Bonus/supplementary skill

RULES:
- Every bullet MUST use the "Ask: ... → Have: ..." format
- Only put something in Gaps if it is a genuine gap — do NOT invent gaps
- NEVER suggest alternative roles, lower titles, or different career paths
- NEVER pass judgment on the candidacy — present facts only, no opinions
- Corporate Finance experience (controlling, FP&A, P&L ownership) is highly transferable to Finance consulting — treat it as such
- Infer importance from job description context (required vs preferred, emphasis, frequency mentioned)
- Cite actual numbers from resume (years, dollar amounts, team sizes)
- Keep each bullet to one line
- List most critical items first within each section

CANDIDATE RESUME:
${JSON.stringify(resumeData, null, 2)}`;

    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
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
