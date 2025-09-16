# Deployment Guide

This guide covers deploying the VideoParser service to production with proper security and compliance configurations.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fvideo-parser-service)

## 📋 Pre-Deployment Checklist

### Required Services

- [ ] **PostgreSQL Database** (Neon, PlanetScale, or Supabase)
- [ ] **Redis Instance** (Upstash for rate limiting)
- [ ] **Stripe Account** (payment processing)
- [ ] **Clerk Account** (authentication)
- [ ] **Domain Name** (for production)

### Legal & Compliance

- [ ] Update business information in legal pages
- [ ] Register DMCA agent with Copyright Office
- [ ] Set up abuse monitoring email addresses
- [ ] Configure CSP headers for security
- [ ] Review platform terms compliance

## 🔧 Environment Configuration

### Production Environment Variables

Create these environment variables in your deployment platform:

```env
# Database (Required)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Authentication (Required)
CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."

# Payments (Required)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Rate Limiting (Recommended)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Metadata Service (Required)
MEDIA_META_API_KEY="your_service_key"

# App Configuration (Required)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Optional: File Storage
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

## 🔨 Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the root directory

### 2. Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty (auto-detected)
- **Install Command**: `npm install`

### 3. Environment Variables

Add all required environment variables in the Vercel dashboard under "Environment Variables".

### 4. Domain Configuration

1. Add your custom domain in Vercel dashboard
2. Update DNS records as instructed
3. SSL certificate will be auto-generated

### 5. Webhook Configuration

Set up webhooks for Stripe and Clerk:

**Stripe Webhooks:**
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events: `customer.subscription.*`, `invoice.payment_*`

**Clerk Webhooks:**
- URL: `https://yourdomain.com/api/clerk/webhook`
- Events: `user.created`, `user.updated`, `user.deleted`

## 🗄️ Database Setup

### Option 1: Neon (Recommended)

1. Create account at [Neon](https://neon.tech/)
2. Create a new project
3. Copy connection string to `DATABASE_URL`
4. Run migrations:

```bash
npx prisma migrate deploy
```

### Option 2: PlanetScale

1. Create account at [PlanetScale](https://planetscale.com/)
2. Create database
3. Create production branch
4. Use connection string in `DATABASE_URL`

### Option 3: Supabase

1. Create project at [Supabase](https://supabase.com/)
2. Go to Settings > Database
3. Copy connection string
4. Enable Row Level Security (RLS) if needed

## 🔒 Security Configuration

### 1. Content Security Policy

Add to your Vercel configuration:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.dev *.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' *.clerk.dev *.stripe.com; frame-src *.stripe.com;"
        }
      ]
    }
  ]
}
```

### 2. Rate Limiting Setup

Configure Upstash Redis:

1. Create account at [Upstash](https://upstash.com/)
2. Create Redis database
3. Copy REST URL and token
4. Add to environment variables

### 3. Error Monitoring

Set up error tracking (optional but recommended):

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "video-parser",
})
```

## 📊 Monitoring Setup

### 1. Vercel Analytics

Enable in Vercel dashboard:
- Go to project settings
- Enable "Analytics"
- Enable "Speed Insights"

### 2. Database Monitoring

Set up connection pooling and monitoring:

```env
# For high-traffic applications
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
```

### 3. Custom Monitoring

Add monitoring endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 500 })
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📧 Email Configuration

Set up transactional emails for important notifications:

### 1. Choose Email Provider

- **Resend** (recommended for simplicity)
- **SendGrid** (enterprise features)
- **Postmark** (developer-friendly)

### 2. Configure Templates

Set up email templates for:
- Welcome emails
- Subscription confirmations
- Usage limit warnings
- DMCA notifications
- Security alerts

## 🏥 Backup Strategy

### 1. Database Backups

Most hosted databases include automatic backups, but consider:

```bash
# Manual backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 2. Environment Variables Backup

Keep a secure backup of your environment variables:

```bash
# Export current env (remove secrets before storing)
vercel env ls > env-backup.txt
```

## 🚨 Incident Response

### 1. Monitoring Alerts

Set up alerts for:
- High error rates (>5%)
- Database connection failures
- Payment processing issues
- Abuse detection triggers

### 2. Emergency Procedures

Create runbooks for:
- DMCA takedown requests
- Platform API changes
- Security incidents
- Service outages

## 📈 Performance Optimization

### 1. CDN Configuration

Vercel provides CDN by default, but optimize:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['img.youtube.com', 'p16-sign-sg.tiktokcdn.com'],
  },
  headers: async () => [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=60' }
      ]
    }
  ]
}
```

### 2. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_parse_records_user_created ON parse_records(user_id, created_at);
CREATE INDEX idx_usage_user_month ON usage(user_id, month);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at);
```

## ✅ Post-Deployment Verification

### 1. Functional Testing

Test these critical paths:
- [ ] User registration and login
- [ ] Video URL parsing
- [ ] Subscription upgrade flow
- [ ] Download functionality (PRO users)
- [ ] Rate limiting enforcement
- [ ] Error handling

### 2. Security Testing

Verify:
- [ ] All API endpoints require authentication where needed
- [ ] Rate limiting is working
- [ ] CORS is properly configured
- [ ] No sensitive data in client-side code
- [ ] Webhook signatures are validated

### 3. Compliance Testing

Check:
- [ ] Platform policy enforcement
- [ ] Copyright protection measures
- [ ] User permission validation
- [ ] Audit logging functionality
- [ ] Legal pages are accessible

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear Vercel cache
vercel --prod --force

# Check build logs
vercel logs [deployment-url]
```

**Database Connection:**
```bash
# Test connection
npx prisma db push --preview-feature
```

**Environment Variables:**
```bash
# Verify variables are set
vercel env ls
```

### Support Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Neon Support**: [neon.tech/docs](https://neon.tech/docs)
- **Stripe Support**: [stripe.com/support](https://stripe.com/support)
- **Clerk Support**: [clerk.dev/support](https://clerk.dev/support)

---

## 📞 Need Help?

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Verify all environment variables are set correctly
4. Test webhook endpoints manually
5. Contact support with specific error messages

Remember: This service handles compliance-sensitive operations. Always test thoroughly before going live!