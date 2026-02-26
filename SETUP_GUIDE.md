# 🚀 STURGEON AI - SETUP GUIDE

## 📋 OVERVIEW

This guide will help you add the new GovCon-inspired features to your Sturgeon AI platform:
- ✅ Dual AI Model Support (GPT-4 + Claude)
- ✅ AI Chat Widget with Model Switcher
- ✅ Marketing Agent (8 content types)
- ✅ Demo Mode (no charges during development)

---

## ⚙️ STEP 1: INSTALL DEPENDENCIES

Run this command in your project root:

\`\`\`bash
npm install openai@^4.65.0 @anthropic-ai/sdk@^0.30.0 framer-motion@^11.11.17 lucide-react@^0.456.0 @radix-ui/react-select@^2.1.2 @radix-ui/react-dropdown-menu@^2.1.2 @radix-ui/react-dialog@^1.1.2 @radix-ui/react-tooltip@^1.1.4 clsx@^2.1.1 tailwind-merge@^2.5.4
\`\`\`

**OR** copy the `package.json` provided and run:
\`\`\`bash
npm install
\`\`\`

---

## 🔑 STEP 2: ENVIRONMENT VARIABLES (DEMO MODE FIRST)

### A. Create `.env.local` file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

### B. Set Demo Mode (recommended for initial testing):
\`\`\`env
# Start with demo mode enabled (NO CHARGES)
NEXT_PUBLIC_DEMO_MODE=true

# Leave API keys empty for now
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
\`\`\`

### C. Test everything in demo mode first!

---

## 📁 STEP 3: ADD THE FILES

All 6 files have been pushed to your GitHub repository:

1. **app/api/chat/route.ts** - Dual AI chat API with demo mode
2. **app/api/marketing/route.ts** - Marketing agent API with demo mode
3. **components/AIChat.tsx** - Floating chat widget component
4. **components/MarketingAgent.tsx** - Marketing content generator
5. **app/chat/page.tsx** - Chat page with model switcher
6. **app/marketing/page.tsx** - Marketing agent page

**Files are already in your `sturgeon-ai-prod` repository!**

---

## 🧪 STEP 4: TEST IN DEMO MODE

1. **Start your development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Visit these pages:**
   - `http://localhost:3000/chat` - Test AI chat widget
   - `http://localhost:3000/marketing` - Test marketing agent
   - `http://localhost:3000/` - See floating chat button

3. **What you'll see:**
   - 📝 **[DEMO MODE]** badges on all responses
   - Mock AI responses (no API charges)
   - All UI features working perfectly

4. **Test these features:**
   - [ ] Switch between GPT-4 and Claude models
   - [ ] Send chat messages
   - [ ] Generate marketing content (all 8 types)
   - [ ] Change tone options
   - [ ] Copy/download content
   - [ ] Clear chat

---

## 💰 STEP 5: ACTIVATE PRODUCTION (WHEN READY)

**⚠️ ONLY DO THIS WHEN YOU'RE READY TO START USING REAL AI (AND BEING CHARGED)**

### A. Get API Keys:

**OpenAI (for GPT-4):**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. **Set billing limits** to prevent overcharges:
   - Go to https://platform.openai.com/settings/organization/billing/limits
   - Set monthly budget (e.g., $20, $50, $100)
   - Set email alerts

**Anthropic (for Claude):**
1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key
3. **Set billing limits** in your Anthropic account

### B. Update `.env.local`:
\`\`\`env
# DISABLE DEMO MODE (will use real APIs)
NEXT_PUBLIC_DEMO_MODE=false

# ADD YOUR REAL API KEYS
OPENAI_API_KEY=sk-proj-...your-key...
ANTHROPIC_API_KEY=sk-ant-...your-key...
\`\`\`

### C. Restart your server:
\`\`\`bash
# Stop the server (Ctrl+C)
npm run dev
\`\`\`

### D. Test with real AI:
- No more **[DEMO MODE]** badges
- Real GPT-4 and Claude responses
- Actual API charges will apply

---

## 💡 COST OPTIMIZATION TIPS

**Use Claude for most tasks** (3x cheaper):
- General chat
- Content generation
- Simple analysis
- High-volume requests

**Use GPT-4 for complex tasks:**
- Deep reasoning
- Complex proposals
- Technical analysis

**Pricing Comparison:**
| Model | Input | Output |
|-------|-------|--------|
| Claude 3.5 | $3/1M tokens | $15/1M tokens |
| GPT-4 Turbo | $10/1M tokens | $30/1M tokens |

**Example costs:**
- 1,000 chat messages (avg 500 tokens each) ≈ $1.50 (Claude) vs $5.00 (GPT-4)
- 100 marketing emails (avg 1,000 tokens each) ≈ $1.50 (Claude) vs $5.00 (GPT-4)

---

## 🔒 SECURITY BEST PRACTICES

1. **Never commit `.env.local` to Git**
   - Already in `.gitignore`
   - Contains sensitive API keys

2. **Set billing limits immediately**
   - Prevent unexpected charges
   - Get email alerts

3. **Use demo mode for development**
   - Test features without charges
   - Switch to production only when ready

4. **Rotate API keys regularly**
   - Every 3-6 months
   - If compromised immediately

5. **Monitor usage in provider dashboards:**
   - OpenAI: https://platform.openai.com/usage
   - Anthropic: https://console.anthropic.com/settings/usage

---

## 🚀 NEXT STEPS

Once everything is working:

1. **Deploy to Vercel:**
   \`\`\`bash
   # Add environment variables in Vercel dashboard
   vercel env add NEXT_PUBLIC_DEMO_MODE
   vercel env add OPENAI_API_KEY
   vercel env add ANTHROPIC_API_KEY

   # Deploy
   vercel --prod
   \`\`\`

2. **Test production deployment:**
   - Visit your deployed URL
   - Test chat and marketing features
   - Verify API keys are working

3. **Monitor costs:**
   - Check OpenAI dashboard daily for first week
   - Check Anthropic dashboard daily for first week
   - Adjust usage patterns based on costs

---

## 🐛 TROUBLESHOOTING

### "API key not configured" error:
- Check `.env.local` exists
- Verify API keys are correct (no extra spaces)
- Restart the dev server

### Demo mode not showing:
- Verify `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
- Clear browser cache
- Restart dev server

### Styles not loading:
- Run `npm install` again
- Check `tailwind.config.js` exists
- Restart dev server

### TypeScript errors:
- Run `npm install @types/node @types/react @types/react-dom`
- Check `tsconfig.json` exists

---

## 📞 SUPPORT

If you need help:
1. Check the troubleshooting section above
2. Review `.env.example` for correct variable names
3. Check provider documentation:
   - OpenAI: https://platform.openai.com/docs
   - Anthropic: https://docs.anthropic.com

---

## ✅ SETUP CHECKLIST

Before going live:
- [ ] All dependencies installed (`npm install`)
- [ ] `.env.local` created from `.env.example`
- [ ] Tested in demo mode (all features working)
- [ ] Got API keys from OpenAI and/or Anthropic
- [ ] Set billing limits in both dashboards
- [ ] Updated `.env.local` with real keys
- [ ] Disabled demo mode (`NEXT_PUBLIC_DEMO_MODE=false`)
- [ ] Tested with real AI (successful responses)
- [ ] Deployed to production (Vercel)
- [ ] Monitoring usage in dashboards

---

**🎉 You're all set! Your Sturgeon AI now has world-class AI features with cost protection built in!**
