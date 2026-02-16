# 🚀 Quick Start Guide - AI Resume Chatbot

Your AI Resume Chatbot is ready to launch! Follow these simple steps:

## ✅ What's Been Built

- ✨ Beautiful chat interface (HTML/CSS/JS - no build tools needed!)
- 🤖 Backend API powered by Claude AI (Anthropic)
- 📊 Comprehensive resume data with all your experience organized
- 🎯 Smart AI that adapts responses based on question type (finance, tech, product marketing, supply chain, D365, etc.)

## 📋 Prerequisites

- Node.js installed (check with `node --version`)
- Anthropic API key (get from https://console.anthropic.com/)

## 🔧 Setup Steps

### Step 1: Get Your API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy it (you'll need it in Step 2)

### Step 2: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` file and add your API key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx-your-actual-key-here
PORT=3000
```

### Step 3: Customize Your Resume Data

Edit `backend/resume-data.json` with your:
- Name, contact info, LinkedIn, email
- Any additional information you want to add

**Your complete professional history is already there!** Including:
- All experience from Unilever, Ecolab, Bank of America, etc.
- Education (MBA from St. Gallen, Engineering degree)
- Skills, certifications, achievements
- Cover letter content and personality
- Company-specific context (Archilogic, Givaudan, Siemens, etc.)

### Step 4: Start the Backend

```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
📝 Resume data loaded
🤖 AI powered by Claude
```

### Step 5: Open the Frontend

**Option 1 (Simplest):** Just double-click `index.html`

**Option 2 (Better):** Use a local web server:
```bash
# From the project root directory
python3 -m http.server 8080
```
Then open: http://localhost:8080

**Option 3 (Node):**
```bash
npx http-server -p 8080
```

## 🎉 You're Live!

Visit the chat interface and try asking:
- "Tell me about your finance experience"
- "What's your background in data and analytics?"
- "Tell me about your supply chain expertise"
- "What experience do you have with ERP implementations?"
- "Why would you be a good D365 Solution Architect?"
- "Tell me about your startup"
- "What makes you unique?"

## 🎨 Customization

### Change Colors
Edit the `<style>` section in `index.html`:
- Line 17: Main gradient `#667eea` and `#764ba2`
- Modify any colors to match your brand

### Update Suggestion Chips
Edit `index.html` around line 297 to change the quick question buttons

### Modify AI Behavior
Edit `backend/server.js` line 41 onwards to adjust how the AI responds

## 🌐 Deployment

### Deploy Backend
- **Railway**: Connect GitHub repo, Railway auto-deploys
- **Render**: Create new Web Service, link repo
- **Heroku**: `git push heroku main`
- Any Node.js hosting

### Deploy Frontend
- **Netlify**: Drag and drop `index.html` or connect GitHub
- **Vercel**: Deploy with `vercel` CLI
- **GitHub Pages**: Enable in repo settings
- Any static hosting

**Important:** After deploying backend, update `API_URL` in `index.html` (line 291) to your deployed backend URL.

## 💰 Cost

Claude Sonnet 4.5 pricing:
- $3 per million input tokens
- $15 per million output tokens
- Average conversation: < $0.01

Monitor usage at https://console.anthropic.com/

## 🐛 Troubleshooting

**Chat not responding?**
- Backend running? Check terminal for errors
- API key correct in `.env`?
- CORS issues? Backend should allow localhost

**API errors?**
- Check API key is valid
- Verify you have credits
- Look at backend terminal for error messages

**Frontend can't connect?**
- Backend running on port 3000?
- Check `API_URL` in `index.html` points to `http://localhost:3000/api/chat`
- Open browser console (F12) to see errors

## 📱 Features

### For Visitors
- Ask any question about your professional background
- Get intelligent, context-aware responses
- Beautiful, responsive UI
- Fast and engaging experience

### Smart AI Context
The AI automatically emphasizes different aspects of your experience based on questions:
- **Finance questions** → Focus on FP&A, controlling, $200M projects
- **Tech/Data questions** → Focus on data warehousing, SQL, BI
- **Supply Chain questions** → Focus on procurement, P2P/O2C, plant finance
- **Product Marketing questions** → Focus on FOSS evangelism, customer success
- **D365 questions** → Focus on ERP implementation, solution architecture
- **Entrepreneur questions** → Focus on startup experience

## 🎓 Learning Resources

- **Anthropic API Docs**: https://docs.anthropic.com/
- **Claude Prompt Engineering**: https://docs.anthropic.com/en/docs/prompt-engineering
- **Express.js Docs**: https://expressjs.com/

## 🤝 Next Steps

1. **Test Thoroughly**: Ask lots of questions, see how AI responds
2. **Refine Responses**: Adjust system prompt in `server.js` if needed
3. **Add More Data**: Update `resume-data.json` with new achievements
4. **Deploy**: Share your AI resume with potential employers!
5. **Analytics**: Consider adding analytics to track visitors

## 📞 Support

Having issues? Check:
1. Backend logs in terminal
2. Browser console (F12 → Console tab)
3. Network tab in browser to see API calls

---

Built with ❤️ using Claude AI, Express.js, and vanilla JavaScript.

Your unique combination of finance + technology + entrepreneurship shines through! 🌟
