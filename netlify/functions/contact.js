import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

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

    const { name, email, phone } = await req.json();

    if (!name || !email) {
        return new Response(JSON.stringify({ error: 'Name and email are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const timestamp = new Date().toISOString();
    const subject = `CV Lead: ${name}`;
    const body = `New lead from your CV:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'not provided'}\n\nTime: ${timestamp}`;

    if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && process.env.SES_FROM_EMAIL && process.env.NOTIFY_EMAIL) {
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
    } else if (process.env.GMAIL_USER && process.env.GMAIL_PASS && process.env.NOTIFY_EMAIL) {
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
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
};

export const config = { path: '/api/contact' };
