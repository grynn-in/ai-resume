# AI Resume Chatbot 🤖

An interactive AI-powered chatbot interface for your resume. Visitors can ask questions about your background, skills, and experience, and get intelligent responses powered by Claude AI.

## Features

- 💬 Interactive chat interface
- 🤖 AI-powered responses using Claude
- 📱 Responsive design
- ⚡ Fast and lightweight (no build tools needed)
- 🎨 Modern, clean UI

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Your Resume Data

Edit `backend/resume-data.json` with your personal information:
- Personal info (name, contact, links)
- Professional summary
- Work experience
- Education
- Skills
- Projects
- Certifications
- Languages
- Interests
- Cover letter highlights and personality

**Tip:** The more detailed and authentic your data, the better the AI responses will be!

### 3. Get Your API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Create an API key
4. Copy the key

### 4. Set Up Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 5. Start the Backend Server

```bash
cd backend
npm start
```

The server will run on `http://localhost:3000`

### 6. Open the Frontend

Simply open `index.html` in your browser, or use a simple HTTP server:

```bash
# Option 1: Just double-click index.html

# Option 2: Use Python's built-in server (in the root directory)
python -m http.server 8080
# Then visit http://localhost:8080

# Option 3: Use Node's http-server
npx http-server -p 8080
```

## Usage

1. Open the chat interface in your browser
2. Click on suggested questions or type your own
3. The AI will respond based on your resume data
4. Ask follow-up questions to learn more!

## Example Questions

- "Tell me about your experience"
- "What are your key skills?"
- "What projects have you worked on?"
- "What is your education background?"
- "Why should I hire you?"
- "Tell me about a challenging project you worked on"

## Customization

### Styling

Edit the `<style>` section in `index.html` to customize:
- Colors and gradients
- Fonts and sizes
- Layout and spacing
- Animations

### Resume Data

Edit `backend/resume-data.json` to update your information. The AI will automatically use the new data.

### AI Behavior

Edit the system prompt in `backend/server.js` to change how the AI responds.

## Deployment

### Backend
Deploy to:
- Heroku
- Railway
- Render
- AWS/GCP/Azure
- Any Node.js hosting

### Frontend
Deploy to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting

**Note:** Update the `API_URL` in `index.html` to point to your deployed backend.

## Troubleshooting

**Chat not responding?**
- Make sure backend server is running (`npm start` in backend folder)
- Check that your API key is set in `.env`
- Open browser console to see any error messages

**API errors?**
- Verify your ANTHROPIC_API_KEY is correct
- Check that you have API credits remaining
- Ensure your API key has the correct permissions

## Cost Considerations

This uses Claude Sonnet 4.5, which costs:
- Input: $3 per million tokens
- Output: $15 per million tokens

A typical conversation costs less than $0.01. Monitor your usage in the Anthropic Console.

## License

MIT - Feel free to use and modify for your own resume!

## Credits

Built with:
- Claude AI (Anthropic)
- Express.js
- Vanilla JavaScript
