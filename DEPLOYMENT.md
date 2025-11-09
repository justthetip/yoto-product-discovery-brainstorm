# Deploying AI-Powered Yoto Product Discovery to Vercel

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier)
2. **Anthropic API Key** - Get from [console.anthropic.com](https://console.anthropic.com/settings/keys)
3. **Git Repository** - Your code should be in a GitHub repo

## Quick Deploy (5 minutes)

### Option 1: Deploy via Vercel Dashboard

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect the framework settings

2. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add your API key:
     - Name: `ANTHROPIC_API_KEY`
     - Value: `sk-ant-your-api-key-here`
   - Click "Add"

3. **Deploy**
   - Click "Deploy"
   - Wait 30-60 seconds
   - Your site will be live at `https://your-project.vercel.app`

4. **Access AI Chat**
   - Visit `https://your-project.vercel.app/ai-chat`
   - Start searching with natural language!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /path/to/yoto-test-listing
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (accept default or customize)
# - Directory? ./ (current directory)

# Add environment variable
vercel env add ANTHROPIC_API_KEY production

# Paste your API key when prompted

# Redeploy to apply environment variables
vercel --prod
```

## Vercel Configuration

The project includes a `vercel.json` file that configures:

- **Edge Functions**: Fast, globally distributed AI endpoint at `/api/chat`
- **Static Files**: Product data and web assets served via CDN
- **Caching**: Optimized cache headers for performance
- **Rewrites**: Clean URLs (`/ai-chat` instead of `/web/layout6-ai-chat.html`)

## Cost Estimation

### Vercel (Free Tier)
- ✅ **Hosting**: Free (unlimited static hosting)
- ✅ **Bandwidth**: 100GB/month free
- ✅ **Function Execution**: 100 GB-hours/month free
- ✅ **Edge Functions**: Unlimited requests (within fair use)

**Result**: ~20,000 queries/month within Vercel free tier

### Anthropic API Costs

**Claude 3.5 Sonnet Pricing** (as of 2024):
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

**Typical Query Cost**:
- Input tokens: ~2,000-4,000 (product data + conversation)
- Output tokens: ~300-500 (AI response)
- **Cost per query**: ~$0.01-0.02

**Monthly Estimates**:
| Usage | Queries/Day | Monthly Cost |
|-------|-------------|--------------|
| Light | 10 | $3-6 |
| Moderate | 50 | $15-30 |
| Heavy | 100 | $30-60 |

**Cost Optimization Tips**:
1. Client-side pre-filtering reduces tokens by 90%
2. Response caching reduces API calls by 50-80%
3. Uses gpt-4o-mini option (cheaper alternative)

## Testing Locally Before Deploy

```bash
# Install dependencies for local development
npm install -g vercel

# Install local Edge Function runtime
cd /path/to/yoto-test-listing

# Start local Vercel dev server
vercel dev

# Visit http://localhost:3000/ai-chat
```

**Note**: For local testing, create a `.env` file:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Vercel CDN (Global)               │
│  - Static HTML/CSS/JS cached globally              │
│  - Product JSON (5MB) cached for 24h               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Client (Browser)                        │
│  1. Load 1,383 products (one-time, cached)          │
│  2. User types natural language query               │
│  3. Pre-filter products client-side                 │
│  4. Send top 50-100 products to AI                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│         Edge Function (/api/chat.js)                │
│  - Runs on Cloudflare's global network              │
│  - Receives pre-filtered products                   │
│  - Calls Anthropic Claude API                       │
│  - Returns ranked results + reasoning               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Anthropic Claude API                    │
│  - Semantic understanding of user intent            │
│  - Ranks products by relevance                      │
│  - Explains why products match                      │
│  - Handles conversational refinement                │
└─────────────────────────────────────────────────────┘
```

## Features

### Smart Client-Side Pre-Filtering
Before calling the AI API, the client extracts:
- **Price limits**: "under £10" → filters products by price
- **Age ranges**: "4-year-old" → filters by age appropriateness
- **Durations**: "under 20 minutes" → filters by runtime
- **Content types**: "bedtime stories" → filters by category
- **Keywords**: Matches against title, author, description

This reduces the products sent to AI from 1,383 to typically 50-100, **saving 90% on token costs**.

### AI Semantic Ranking
The AI then:
- Understands nuanced intent ("calming", "not scary", "educational")
- Ranks products by true relevance
- Explains why each product matches
- Suggests alternatives and refinements

### Response Caching
Common queries are cached in browser localStorage:
- "bedtime stories for 4-year-olds" → cached
- Reduces API calls by 50-80%
- Instant responses for repeated queries

### Conversation Context
Maintains chat history for:
- "Make them cheaper" → remembers previous search
- "Show me more like the second one" → recalls results
- Multi-turn refinement without re-explaining context

## Monitoring & Limits

### Check Your Usage

**Vercel Dashboard**:
- Go to your project → Analytics
- View bandwidth, function execution, requests
- Monitor against free tier limits

**Anthropic Dashboard**:
- Go to [console.anthropic.com](https://console.anthropic.com)
- Usage → View API usage and costs
- Set up billing alerts

### Set Up Rate Limiting (Recommended)

To prevent abuse and control costs, add rate limiting to `/api/chat.js`:

```javascript
// Add to the top of /api/chat.js
const requestCounts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 50; // 50 requests per hour

  const userRequests = requestCounts.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}
```

## Troubleshooting

### Error: "ANTHROPIC_API_KEY not configured"
**Solution**: Add environment variable in Vercel dashboard and redeploy

### Error: "Failed to load product catalogue"
**Solution**: Check that `/data/yoto-content.json` exists and is accessible

### Error: "API request failed" (429)
**Solution**: Rate limit exceeded. Wait or upgrade Anthropic plan

### Edge Function times out
**Solution**: Pre-filtering should prevent this. Check that products array is limited to 100 items

### High API costs
**Solutions**:
1. Increase caching (reduce unique queries)
2. Add rate limiting (limit queries per user)
3. Switch to OpenAI gpt-4o-mini (cheaper)
4. Implement query similarity detection

## Advanced Configuration

### Using OpenAI Instead of Anthropic

In `layout6-ai-chat.js`, change the provider:

```javascript
provider: 'openai'  // Instead of 'anthropic'
```

Add `OPENAI_API_KEY` environment variable in Vercel.

**OpenAI Pricing** (gpt-4o-mini):
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- **~10x cheaper than Claude** but slightly lower quality

### Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `yoto-search.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

### Analytics & Monitoring

Add analytics to track:
- Most common queries
- Conversion rates (clicks on products)
- User engagement metrics

Vercel includes basic analytics on the free tier.

## Next Steps

1. **Deploy** using one of the methods above
2. **Test** the AI chat with various queries
3. **Monitor** costs and usage
4. **Iterate** based on user feedback
5. **Scale** as needed (Vercel handles this automatically)

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Anthropic Docs**: [docs.anthropic.com](https://docs.anthropic.com)
- **Project Issues**: [GitHub Issues](https://github.com/justthetip/yoto-product-discovery-brainstorm/issues)

---

**Ready to Deploy?** 🚀

```bash
vercel
```
