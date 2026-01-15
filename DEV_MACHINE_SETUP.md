# Praxio Website - Development Machine Setup Guide

**Last Updated:** January 8, 2026  
**Repository:** https://github.com/agaaliche/praxio-website.git  
**Branch:** master

This guide provides step-by-step instructions for setting up a new development machine for the Praxio Website project.

---

## Prerequisites

### Required Software
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Git**: Latest version
- **MySQL Client**: For database access (shared with inrManager)
- **Code Editor**: VS Code recommended

### Cloud Access Required
- Google Cloud Platform account (shared with inrManager)
  - Cloud SQL (MySQL database)
  - Cloud Run (optional deployment)
- Firebase project access (shared with inrManager)
- Stripe account (for subscriptions)
- SendGrid account (for email service)

---

## 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/agaaliche/praxio-website.git
cd praxio-website

# Verify branch
git branch
# Should show: * master
```

---

## 2. Install i18n Package

The project uses a local `@praxio/i18n` package from the monorepo:

```bash
# Install i18n package dependencies first
cd ../packages/i18n
npm install

# Return to main project
cd ../../praxio-website
```

---

## 3. Install Dependencies

```bash
# Install all dependencies including @praxio/i18n
npm install
```

---

## 4. Configure Environment

### 4.1 Create `.env.local`

Create `praxio-website/.env.local` with the following structure (get actual values from project admin):

```env
# Database Configuration (Shared with inrManager)
DB_HOST=34.xxx.xxx.xxx
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=inr_db

# Firebase Admin SDK (Service Account)
FIREBASE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account"
}'

# Firebase Client Configuration (Public)
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NUXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Stripe Product/Price IDs
STRIPE_PRICE_MONTHLY=price_xxxxx
STRIPE_PRICE_YEARLY=price_xxxxx
STRIPE_PRODUCT_ID=prod_xxxxx

# SendGrid Email Service
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@praxio.net
SENDGRID_FROM_NAME=Praxio

# Site Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SUPPORT_URL=https://praxio.net/support

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Environment
NODE_ENV=development
```

### 4.2 Database Connection Setup

Same as inrManager - use Cloud SQL Proxy or direct connection:

```bash
# Option A: Cloud SQL Proxy (Recommended)
cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE_NAME=tcp:3306

# Option B: Direct Connection
# Whitelist your IP in Cloud SQL settings
```

### 4.3 Test Database Connection

```bash
# Test database connection
node check-sessions.js
# Should show user data and sessions
```

---

## 5. Start Development Server

```bash
# Development mode with hot reload
npm run dev
```

Application should be running on: **http://localhost:3000**

---

## 6. Project Architecture

### Framework
- **Nuxt 3**: Vue.js meta-framework with SSR support
- **Vue 3**: Composition API
- **Tailwind CSS**: Utility-first CSS framework

### Key Features

#### Authentication System
- Firebase Auth with custom branded emails
- Magic link authentication for team members
- Email change with verification flow
- Password reset with custom templates
- Session management with device tracking

#### i18n (Internationalization)
- **Package:** `@praxio/i18n` (local monorepo package)
- **Supported Languages:** English (en), French (fr)
- **SSR Support:** Server-side locale detection from cookies
- **Cookie Sync:** Automatic sync between localStorage and cookies
- **Files:**
  - `packages/i18n/locales/` - Translation files
  - `app/composables/useI18n.js` - i18n composable
  - `app/plugins/i18n.js` - Plugin for SSR support
  - `app/components/LanguageSelector.vue` - Language switcher

#### Email Service
- **Provider:** SendGrid
- **Templates:** `packages/messaging/templates/emails/`
- **Service:** `server/services/emailService.js`
- **Types:**
  - Account verification
  - Password reset
  - Email change confirmation
  - Password changed notification
  - Team invitations
  - Magic link authentication

#### Team Management
- Role-based access control (viewer, editor, account owner)
- Magic link invitations
- Session management and revocation
- Real-time permission updates

#### Subscription Management
- Stripe integration
- Monthly and yearly plans
- Trial period support
- Billing portal access

---

## 7. Project Structure

```
praxio-website/
├── app/
│   ├── components/
│   │   ├── CookieConsent.vue       # GDPR cookie consent
│   │   ├── LanguageSelector.vue    # Language switcher
│   │   └── TheHeader.vue           # Main navigation
│   ├── composables/
│   │   ├── useAuth.ts              # Authentication composable
│   │   ├── useI18n.js              # i18n composable
│   │   └── useSubscription.ts      # Subscription state
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── action.vue          # Email verification handler
│   │   │   └── magic-link.vue      # Magic link handler
│   │   ├── account/
│   │   │   ├── settings/           # Profile, security, billing
│   │   │   └── team.vue            # Team management
│   │   ├── index.vue               # Home page
│   │   ├── signin.vue              # Sign in page
│   │   └── signup.vue              # Sign up page
│   ├── plugins/
│   │   ├── i18n.js                 # i18n SSR plugin
│   │   └── fetch-interceptor.ts    # Global 401 handler
│   └── app.vue
├── server/
│   ├── api/
│   │   ├── auth/                   # Auth endpoints
│   │   ├── patients/               # Patient management
│   │   ├── sessions/               # Session management
│   │   └── users/                  # User management
│   ├── services/
│   │   ├── authEmailService.ts     # Auth email templates
│   │   ├── emailService.js         # Centralized email service
│   │   └── emailChangeService.ts   # Email change logic
│   ├── utils/
│   │   ├── auth.ts                 # Auth verification
│   │   ├── database.ts             # Database connection
│   │   ├── firebase-admin.ts       # Firebase Admin SDK
│   │   └── magicLinkService.ts     # Magic link generation
│   └── migrations/                 # Database migrations
├── packages/
│   ├── i18n/                       # Shared i18n package
│   │   ├── locales/                # Translation files
│   │   └── src/                    # i18n utilities
│   └── messaging/                  # Email templates package
│       └── templates/
│           └── emails/             # HTML email templates
├── public/
│   └── sync-locale.html            # Cookie sync utility
├── nuxt.config.ts                  # Nuxt configuration
├── tailwind.config.js              # Tailwind configuration
├── package.json
└── DEV_MACHINE_SETUP.md           # This file
```

---

## 8. Database Schema

### Tables Used
- `users` - Account owners (shared with inrManager)
- `authorized_users` - Team members (viewers/editors)
- `sessions` - Active user sessions with device info
- `patients` - Patient records (shared with inrManager)
- `email_change_tokens` - Email change verification tokens

### Migrations

Run database migrations if setting up fresh database:

```bash
# Create sessions table
node server/migrations/create-sessions-table.js

# Update sessions table with new columns
node server/migrations/update-sessions-table.js
```

---

## 9. Development Workflow

### Running the Application

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

### Code Quality

```bash
# Type checking
npx nuxi typecheck

# Linting
npm run lint

# Format code (if configured)
npm run format
```

### Testing Features

#### Test Authentication
1. Navigate to http://localhost:3000/signin
2. Sign in with test account
3. Verify session creation in database
4. Check email logs in console

#### Test i18n
1. Click language selector in header
2. Switch between English and French
3. Verify translations update
4. Check cookie is set: `praxio_language`
5. Reload page to verify SSR locale detection

#### Test Team Management
1. Sign in as account owner
2. Navigate to `/account/team`
3. Invite a team member
4. Check magic link in console logs
5. Open magic link in incognito window
6. Verify auto sign-in works

#### Test Session Management
1. Sign in from multiple devices/browsers
2. Navigate to `/account/settings/security`
3. View active sessions list
4. Revoke a session
5. Verify that device is signed out

---

## 10. Email Templates

Email templates are in `packages/messaging/templates/emails/`:

- **InvitationTemplate** - Team member invitations
- **CredentialsTemplate** - Account credentials
- **VerificationTemplate** - Email verification
- **PasswordResetTemplate** - Password reset
- **EmailChangeTemplate** - Email change verification
- **PasswordChangedTemplate** - Password change confirmation
- **EmailChangedTemplate** - Email address change confirmation

### Testing Emails

```bash
# Test email rendering
cd packages/messaging
node test-templates.cjs
```

Templates output HTML to `test-output.html` for preview.

---

## 11. Common Issues & Solutions

### Issue: i18n Package Not Found
**Solution:**
```bash
cd ../packages/i18n
npm install
cd ../../praxio-website
npm install
```

### Issue: Database Connection Failed
**Solution:**
- Same as inrManager setup
- Verify Cloud SQL Proxy is running
- Check credentials in .env.local

### Issue: SendGrid Emails Not Sending
**Solution:**
- Verify SENDGRID_API_KEY in .env.local
- Check SendGrid dashboard for API key status
- Development: Emails log to console by default
- Check server logs: `server/services/emailService.js`

### Issue: Session Not Persisted After Sign In
**Solution:**
- Check Firebase configuration is correct
- Verify custom claims are being set (check server logs)
- Clear browser cookies and try again
- Check `sessions` table in database

### Issue: Language Not Persisting After Reload
**Solution:**
- Check cookie is set: DevTools → Application → Cookies
- Verify `praxio_language` cookie exists
- Use `public/sync-locale.html` to manually sync
- Check i18n plugin is loading (check SSR logs)

### Issue: Magic Link Not Working
**Solution:**
- Verify token in `authorized_users` table
- Check token hasn't expired (48-hour expiry)
- Verify Firebase UID format: `user_{id}_{account_owner_id}`
- Check server logs for detailed error messages

---

## 12. API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in existing user
- `POST /api/auth/request-email-change` - Request email change
- `POST /api/auth/verify-email-change` - Verify email change
- `POST /api/auth/send-password-changed` - Send password change confirmation

### User Management
- `GET /api/users/current` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/preferences` - Update user preferences
- `POST /api/users/team` - Invite team member
- `POST /api/users/auth/magic-link` - Validate magic link

### Session Management
- `GET /api/sessions/list` - List active sessions (paginated)
- `POST /api/sessions/revoke` - Revoke specific session
- `POST /api/sessions/revoke-all` - Revoke all other sessions
- `POST /api/sessions/delete-current` - Delete current session

### Patients
- `GET /api/patients` - List all patients for account

---

## 13. Environment Variables Reference

### Required Variables
```env
DB_HOST                              # Database host
DB_USER                              # Database user
DB_PASSWORD                          # Database password
FIREBASE_SERVICE_ACCOUNT_KEY         # Firebase Admin SDK
NUXT_PUBLIC_FIREBASE_API_KEY         # Firebase client config
STRIPE_SECRET_KEY                    # Stripe secret key
SENDGRID_API_KEY                     # SendGrid API key
```

### Optional Variables
```env
NUXT_PUBLIC_SITE_URL                 # Base URL (default: localhost)
NUXT_PUBLIC_SUPPORT_URL              # Support page URL
SESSION_SECRET                       # Session encryption key
NODE_ENV                             # Environment (development/production)
```

---

## 14. Deployment

### Option A: Google Cloud Run

```bash
# Build Docker image (create Dockerfile first)
docker build -t gcr.io/PROJECT_ID/praxio-website .

# Push to Container Registry
docker push gcr.io/PROJECT_ID/praxio-website

# Deploy
gcloud run deploy praxio-website \
  --image gcr.io/PROJECT_ID/praxio-website \
  --platform managed \
  --region us-east4 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

### Option B: Vercel/Netlify

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

---

## 15. Recent Changes (January 8, 2026)

### Commit: ee0c200 - "Authentication & i18n improvements"

**Major Updates:**
- ✅ Email change verification flow with custom templates
- ✅ Session management with device tracking
- ✅ SendGrid integration (`@sendgrid/mail` package)
- ✅ i18n SSR support with cookie synchronization
- ✅ CookieConsent component for GDPR compliance
- ✅ Fetch interceptor for global 401 handling
- ✅ Mobile responsive tables and overflow fixes
- ✅ Database migrations for sessions table
- ✅ Bug fixes: component lifecycle, role detection

**Files Modified:** 43 files, 1,611 insertions, 250 deletions

---

## Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies for `packages/i18n`
- [ ] Install dependencies for `praxio-website`
- [ ] Create `.env.local` with all required variables
- [ ] Configure Cloud SQL access (proxy or whitelist IP)
- [ ] Test database connection
- [ ] Run database migrations (if needed)
- [ ] Start development server (port 3000)
- [ ] Test sign in/sign up flows
- [ ] Verify emails log to console
- [ ] Test language switching (en/fr)
- [ ] Test session management in security settings
- [ ] Test team member invitation flow

**Estimated Setup Time:** 30-45 minutes (with credentials ready)

---

## 16. Contact & Resources

### Documentation
- **API Documentation:** This file
- **Email Templates:** `packages/messaging/README.md`
- **i18n Package:** `packages/i18n/README.md`

### Related Projects
- **inrManager:** Main INR management application (shares database)
- **@praxio/i18n:** Shared internationalization package
- **@praxio/messaging:** Shared email templates package

### Getting Help
- Check commit history: `git log --oneline`
- Review recent changes: `git diff HEAD~1`
- For credential access: Contact project administrator

---

**Happy Coding! 🚀**

