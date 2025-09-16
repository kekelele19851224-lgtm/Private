# VideoParser Service

A compliance-first video metadata extraction and download service built with Next.js, Prisma, and Stripe. This service respects platform terms of service and copyright laws, only enabling downloads for explicitly permitted content.

## 🛡️ Compliance Features

- **Platform Respect**: Strict adherence to platform terms of service
- **Copyright Protection**: DMCA compliance and copyright verification
- **Permission Checks**: User authorization declarations required
- **Audit Logging**: Complete tracking of all user activities
- **Rate Limiting**: Anti-abuse protection with usage monitoring

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd video-parser-service
npm install
# or
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/video_parser_db"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Third-party API for compliant metadata
MEDIA_META_API_KEY=your_metadata_service_key

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npm run db:seed
```

### 4. Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Architecture

### Core Modules

- **`lib/allowed-platforms.ts`** - Platform policies and support matrix
- **`lib/permission-check.ts`** - Download permission validation
- **`lib/rate-limit.ts`** - Rate limiting and abuse prevention
- **`lib/usage.ts`** - Usage tracking and quota management
- **`lib/stripe.ts`** - Subscription and payment handling
- **`lib/audit.ts`** - Compliance logging and monitoring

### API Routes

- **`/api/parse`** - Video URL parsing and metadata extraction
- **`/api/download`** - Secure download generation (PRO only)
- **`/api/stripe/*`** - Subscription management
- **`/api/clerk/webhook`** - User synchronization

### Pages

- **`/`** - Landing page with compliance messaging
- **`/dashboard`** - User dashboard with usage tracking
- **`/pricing`** - Subscription plans and features
- **`/app/parse`** - Main parsing interface
- **`/legal/*`** - Terms, Privacy, AUP, and DMCA policies

## 🔒 Security & Compliance

### Platform Compliance

Each supported platform has specific policies enforced:

```typescript
const PLATFORM_POLICIES = {
  youtube: { allowMetadata: true, allowEmbed: true, allowDownload: false },
  tiktok: { allowMetadata: true, allowEmbed: true, allowDownload: false },
  vimeo: { allowMetadata: true, allowEmbed: true, allowDownload: true, requiresAuth: true },
}
```

### Permission Validation

All download requests go through strict permission checking:

1. Platform policy verification
2. User authorization declaration
3. Subscription level validation
4. Content license analysis
5. Audit logging

### Rate Limiting

- **Free Users**: 10 parses/day, no downloads
- **PRO Users**: 100 parses/day, 20 downloads/day
- **Global Limits**: Anti-abuse IP-based restrictions

## 📊 Subscription Plans

### Free Plan
- 10 video parses per day
- Metadata extraction only
- No download functionality
- Basic support

### PRO Plan ($9.99/month)
- 100 video parses per day
- Download permitted content
- Priority support
- API access
- Advanced analytics

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Import your Git repository to Vercel
2. **Environment Variables**: Add all required env vars in Vercel dashboard
3. **Database**: Set up PostgreSQL (Neon, PlanetScale, or Supabase)
4. **Deploy**: Automatic deployments on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Required Services

1. **PostgreSQL Database** (Neon, PlanetScale, AWS RDS)
2. **Redis** (Upstash for rate limiting)
3. **Stripe** (payment processing)
4. **Clerk** (authentication)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with UI
npm run test:ui

# Run type checking
npx tsc --noEmit

# Run linting
npm run lint
```

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | ✅ | Clerk authentication secret |
| `STRIPE_SECRET_KEY` | ✅ | Stripe payment processing |
| `MEDIA_META_API_KEY` | ✅ | Third-party metadata service |
| `UPSTASH_REDIS_REST_URL` | ⚠️ | Redis for rate limiting (optional) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app's public URL |

## 🔧 Configuration

### Platform Support

Add new platforms in `lib/allowed-platforms.ts`:

```typescript
newplatform: {
  allowMetadata: true,
  allowEmbed: true,
  allowDownload: false, // Usually false for compliance
  requiresAuth: true,
  name: 'New Platform',
  domains: ['newplatform.com', 'www.newplatform.com']
}
```

### Subscription Plans

Modify plans in `lib/stripe.ts`:

```typescript
export const STRIPE_PLANS = {
  PRO: {
    priceId: 'price_your_stripe_price_id',
    name: 'Pro Plan',
    price: 9.99,
    features: [...]
  }
}
```

## 📚 API Documentation

### Parse Video

```bash
POST /api/parse
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=...",
  "userDeclaration": {
    "hasPermission": true,
    "isContentOwner": false,
    "hasCreatorAuth": false
  }
}
```

### Download Video (PRO only)

```bash
POST /api/download
Content-Type: application/json

{
  "parseRecordId": "cuid_parse_record_id",
  "format": "mp4",
  "quality": "720p"
}
```

## 🚨 Compliance Requirements

### DMCA Compliance

- All download requests are logged
- DMCA takedown process implemented
- Repeat infringer policy enforced
- Safe harbor protections maintained

### Platform Terms

- YouTube: Downloads generally prohibited
- TikTok: Downloads prohibited except own content
- Vimeo: Respects creator download settings
- Others: Case-by-case policy enforcement

### User Responsibilities

Users must:
- Have permission to access content
- Respect copyright and intellectual property
- Follow platform terms of service
- Not use for unauthorized commercial purposes

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Verify `DATABASE_URL` format
2. **Clerk Setup**: Ensure webhook URLs are configured
3. **Stripe Webhooks**: Test webhook endpoints locally
4. **Rate Limiting**: Check Redis connection for Upstash

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Database debugging
npx prisma studio
```

## 📄 Legal

This project includes comprehensive legal documentation:

- **Terms of Service** (`/legal/terms`)
- **Privacy Policy** (`/legal/privacy`)
- **Acceptable Use Policy** (`/legal/aup`)
- **DMCA Policy** (`/legal/dmca`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure all tests pass
4. Submit a pull request

## 📞 Support

- **General**: support@videoparser.com
- **DMCA**: dmca@videoparser.com
- **Abuse**: abuse@videoparser.com
- **Legal**: legal@videoparser.com

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⚠️ Important**: This service is designed for compliant use only. Users are responsible for ensuring they have the right to access and download content. The service enforces platform terms of service and copyright laws.