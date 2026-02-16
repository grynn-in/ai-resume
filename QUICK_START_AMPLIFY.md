# 🚀 Deploy Your AI Resume to AWS Amplify in 5 Minutes

## What You Get
- ✨ Live website with custom domain
- 🤖 AI chatbot powered by Claude
- 🔒 Secure (API key hidden in Lambda)
- 💰 Free tier (likely free forever for personal use)
- 📈 Auto-scaling
- 🔄 Auto-deploys when you update GitHub

---

## Super Quick Deploy

### 1️⃣ Push to GitHub (if you haven't)

```bash
cd /home/pd/myCV
git init
git add .
git commit -m "AI Resume Chatbot"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-resume.git
git push -u origin main
```

### 2️⃣ Deploy to Amplify

1. Go to: https://console.aws.amazon.com/amplify/
2. Click **"New app"** → **"Host web app"**
3. Connect **GitHub**
4. Select your repo → **Next**
5. Amplify auto-detects settings ✅
6. **"Save and deploy"**

### 3️⃣ Add Your API Key

In Amplify Console:
1. Click your app → **"Environment variables"**
2. Click **"Add variable"**
3. Key: `ANTHROPIC_API_KEY`
4. Value: `your-anthropic-api-key-here`
5. **Save**

### 4️⃣ Set Up Backend API

**Option A: API Gateway + Lambda (Recommended)**

1. Open AWS Lambda console
2. Create function:
   - Name: `ai-resume-api`
   - Runtime: Node.js 18
   - Create function
3. Upload code:
   - Zip `amplify/backend-function/*`
   - Upload to Lambda
4. Add environment variable in Lambda:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key
5. Create API Gateway:
   - REST API
   - Resource: `/chat`
   - Method: POST
   - Integration: Lambda function
   - Enable CORS
6. Deploy API → Get endpoint URL

**Option B: Lambda Function URL (Simpler)**

1. In Lambda function, go to **Configuration** → **Function URL**
2. Click **Create function URL**
3. Auth type: **NONE**
4. Enable **CORS**
5. **Save**
6. Copy the function URL

### 5️⃣ Update Frontend

Edit `index.html` line 291:
```javascript
const API_URL = 'https://YOUR_LAMBDA_URL_HERE';
// Or: 'https://YOUR_API_GATEWAY_URL/prod/chat';
```

Commit and push:
```bash
git add index.html
git commit -m "Update API URL"
git push
```

Amplify auto-deploys! 🎉

### 6️⃣ Access Your Live Site

Your Amplify URL: `https://main.d1234.amplifyapp.com`

**Done!** 🚀

---

## Costs

- **Amplify Free Tier**: 1000 build minutes/month, 15GB storage
- **Lambda Free Tier**: 1M requests/month
- **Claude API**: ~$0.01 per conversation
- **Total**: Likely **$0-2/month** for personal use

---

## Custom Domain (Optional)

1. In Amplify → **Domain management**
2. Add domain
3. Follow DNS instructions
4. Get free SSL certificate ✅

---

## Alternative: All-in-One Deploy Script

Want me to create a one-command deploy script that handles everything automatically?
