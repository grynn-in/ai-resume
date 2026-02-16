const Anthropic = require('@anthropic-ai/sdk');
const resumeData = require('./resume-data.json');

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { message } = body;

        if (!message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Initialize Anthropic
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        // Create system prompt with resume data
        const systemPrompt = `You are an AI assistant representing a professional's resume. Answer questions about their background, skills, experience, and qualifications based on the following resume data:

${JSON.stringify(resumeData, null, 2)}

Guidelines:
- Answer questions naturally and conversationally
- Only provide information from the resume data provided
- If asked about something not in the resume, politely say you don't have that information
- Be enthusiastic and professional
- Keep responses concise but informative (2-4 paragraphs max)
- Highlight relevant achievements and skills when appropriate
- When asked about specific role types (finance, data, supply chain, product marketing, D365, etc.), emphasize the most relevant experience from the resume data`;

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        });

        const aiResponse = response.content[0].text;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response: aiResponse })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                response: `Sorry, I encountered an error: ${error.message}`
            })
        };
    }
};
