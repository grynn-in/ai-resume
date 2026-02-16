# Deploy to AWS Amplify

## Why Amplify?
- ✅ Serverless (no server to manage!)
- ✅ Auto-scaling
- ✅ Free tier (1000 build minutes, 5GB storage)
- ✅ HTTPS included
- ✅ CI/CD from GitHub
- ✅ Lambda functions for backend

## Cost Estimate
- **Free tier**: Generous (perfect for personal resume)
- **After free tier**: ~$0-5/month depending on traffic
- **Claude API**: ~$0.01 per conversation

---

## Quick Deploy (2 Methods)

### Method 1: Amplify Console (Easiest - 5 minutes)

#### Step 1: Prepare Your Code

First, push your code to GitHub:
```bash
cd /home/pd/myCV
git init
git add .
git commit -m "Initial commit - AI Resume Chatbot"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-chatbot.git
git push -u origin main
```

#### Step 2: Deploy to Amplify

1. Go to https://console.aws.amazon.com/amplify/
2. Click **"New app"** → **"Host web app"**
3. Connect to **GitHub**
4. Select your repository
5. Click **"Next"**
6. Amplify detects it's a static site ✅
7. Click **"Next"** → **"Save and deploy"**

#### Step 3: Add Backend Function

In Amplify Console:
1. Go to **"Backend environments"** tab
2. Click **"Add backend"**
3. Choose **"Serverless function"**
4. Configure:
   - Runtime: **Node.js 18**
   - Upload the `amplify/backend-function` folder
5. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `your-anthropic-api-key-here`

#### Step 4: Update Frontend

Get your Lambda function URL from Amplify console.

Update `index.html` line 291:
```javascript
const API_URL = 'https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/';
```

Push to GitHub - Amplify auto-deploys! 🚀

---

### Method 2: Amplify CLI (More Control)

#### Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### Initialize Amplify

```bash
cd /home/pd/myCV
amplify init

# Answer prompts:
# - Name: ai-resume-chatbot
# - Environment: prod
# - Editor: your choice
# - Type: JavaScript
# - Framework: None
# - Source: .
# - Distribution: .
# - Build: npm run build (or just Enter for none)
# - Start: npm start (or just Enter)
```

#### Add Hosting

```bash
amplify add hosting

# Choose:
# - Hosting with Amplify Console (Managed hosting with CI/CD)
# - Manual deployment
```

#### Add API Function

```bash
amplify add function

# Configure:
# - Name: aiResumeAPI
# - Runtime: NodeJS
# - Template: Serverless ExpressJS function
# - Advanced: Add environment variable ANTHROPIC_API_KEY
```

Replace generated function code with our Lambda function from `amplify/backend-function/index.js`

#### Add API Gateway

```bash
amplify add api

# Choose:
# - REST
# - Provide a friendly name: aiResumeAPI
# - Path: /chat
# - Lambda function: Choose the one we created
# - Restrict API access: No
```

#### Deploy

```bash
amplify push

# After deployment, get your API endpoint
amplify status
```

#### Update Frontend

Update `index.html` with your API endpoint:
```javascript
const API_URL = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/chat';
```

```bash
amplify publish
```

---

## Even Simpler: Use Amplify Hosting + API Gateway

I can create an `amplify.yml` build spec:

```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - echo "Building frontend"
  artifacts:
    baseDirectory: /
    files:
      - index.html
  cache:
    paths: []
backend:
  phases:
    build:
      commands:
        - cd amplify/backend-function
        - npm install
```

---

## What You Get

After deployment:
- **Frontend URL**: `https://main.d1234abcd.amplifyapp.com`
- **API URL**: `https://abc123.execute-api.region.amazonaws.com/prod/chat`
- **Auto HTTPS** ✅
- **Auto deploys** from git push ✅
- **Serverless** (no server management) ✅

---

## Monitoring

In AWS Console:
- **Amplify**: View builds, deployments
- **CloudWatch**: View Lambda logs
- **API Gateway**: View API metrics

---

## Next Steps

1. **Push to GitHub** (if not already)
2. **Connect Amplify to GitHub**
3. **Add environment variable** for API key
4. **Deploy!**

Your AI resume will be live at a custom Amplify URL! 🎉

Want me to create the complete Amplify configuration files?
