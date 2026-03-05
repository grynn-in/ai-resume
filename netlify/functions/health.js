export default async () => {
    return new Response(JSON.stringify({
        status: 'ok',
        ai: !!process.env.ANTHROPIC_API_KEY,
        timestamp: new Date().toISOString()
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
};

export const config = { path: '/api/health' };
