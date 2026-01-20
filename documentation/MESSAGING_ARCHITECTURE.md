# Messaging & Alert System Architecture

## Overview
Centralized messaging system in Praxio that serves all applications (Retroact, future apps) for:
1. **Alert/Status Pages** - User-facing screens (redirecting, authenticating, errors)
2. **Email Templates** - Transactional emails
3. **Notifications** - In-app and push notifications
4. **SMS/Text Messages** - Future support

## Current State Analysis

### Existing Components

**Email System (Praxio)**
- Location: `praxio-website/server/utils/email.ts`
- Services: `authEmailService.ts`, `emailChangeService.ts`
- Uses Firebase Trigger Email Extension + Firestore
- Templates: Invitation, password reset, email change verification
- i18n: Embedded in email.ts (EN/FR)

**Alert Pages (Praxio)**
- Location: `praxio-website/app/pages/sso/login.vue`
- Types: Loading states, error states, success states
- Hardcoded: Inline HTML with some basic states

**Retroact Emails**
- Location: Likely in inrManager/backend
- Separate email infrastructure
- Not centralized

## Proposed Architecture

```
praxio-website/
├── packages/
│   ├── messaging/                    # NEW: Shared messaging package
│   │   ├── package.json
│   │   ├── templates/
│   │   │   ├── emails/
│   │   │   │   ├── base.ts          # Base email template
│   │   │   │   ├── invitation.ts
│   │   │   │   ├── auth.ts          # Password reset, email change
│   │   │   │   ├── subscription.ts  # Payment, trial, cancellation
│   │   │   │   └── retroact/        # App-specific templates
│   │   │   │       ├── inr-reminder.ts
│   │   │   │       └── dose-alert.ts
│   │   │   └── alerts/              # Alert page templates
│   │   │       ├── auth-status.ts   # Authenticating, redirecting
│   │   │       ├── loading.ts
│   │   │       └── error.ts
│   │   ├── services/
│   │   │   ├── email.service.ts     # Main email sender
│   │   │   ├── sms.service.ts       # Future SMS support
│   │   │   └── notification.service.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── fr.json
│   └── i18n/                         # Existing i18n package
│       └── locales/                  # UI translations only
├── app/
│   ├── components/
│   │   └── alerts/                   # NEW: Reusable alert components
│   │       ├── AlertPage.vue        # Base alert layout
│   │       ├── LoadingAlert.vue
│   │       ├── ErrorAlert.vue
│   │       └── SuccessAlert.vue
│   └── pages/
│       └── sso/
│           └── login.vue             # Use AlertPage components
└── server/
    └── utils/
        └── email.ts                  # Import from @praxio/messaging
```

## Implementation Plan

### Phase 1: Create Messaging Package (Week 1)

1. **Setup Package Structure**
   ```bash
   mkdir -p packages/messaging/templates/emails
   mkdir -p packages/messaging/templates/alerts
   mkdir -p packages/messaging/services
   mkdir -p packages/messaging/locales
   ```

2. **Move Email Templates**
   - Extract email templates from `server/utils/email.ts`
   - Create typed template interfaces
   - Separate concerns: templates vs delivery

3. **Create Alert Component Library**
   - `AlertPage.vue` - Base layout with slots
   - Status components (loading, error, success)
   - Branded consistently with design system

### Phase 2: Centralize Email Delivery (Week 2)

1. **Unified Email Service**
   ```typescript
   // packages/messaging/services/email.service.ts
   export class EmailService {
     private firestore: Firestore
     
     async send(params: EmailParams) {
       // Single source of truth for email delivery
       // Supports: Firebase Extension, SendGrid, Nodemailer
     }
     
     async sendTemplate(template: EmailTemplate, data: any) {
       const rendered = template.render(data)
       return this.send(rendered)
     }
   }
   ```

2. **Template Registry**
   ```typescript
   export const EmailTemplates = {
     invitation: InvitationTemplate,
     passwordReset: PasswordResetTemplate,
     emailChange: EmailChangeTemplate,
     // Retroact-specific
     inrReminder: INRReminderTemplate,
     doseAlert: DoseAlertTemplate,
   }
   ```

### Phase 3: Update Existing Code (Week 3)

1. **Refactor Praxio**
   - Replace inline email code with package imports
   - Use AlertPage components in SSO flow
   - Centralize i18n strings

2. **Integrate with Retroact**
   - Install `@praxio/messaging` package
   - Replace retroact email code
   - Use same infrastructure

### Phase 4: Enhanced Features (Future)

1. **Email Builder UI** (Optional)
   - Admin panel to preview/test templates
   - Visual template editor
   - A/B testing support

2. **Analytics & Tracking**
   - Email open rates
   - Click tracking
   - Delivery status

3. **SMS Support**
   - Twilio integration
   - SMS templates similar to email

## Benefits

### 1. Single Source of Truth
- All messaging logic in one place
- Consistent branding across apps
- Easy to update all apps at once

### 2. Better Developer Experience
```typescript
// Before (scattered)
const html = getInviteEmailTemplate(...)
await sendToFirestore(...)

// After (centralized)
import { EmailService, EmailTemplates } from '@praxio/messaging'

await EmailService.send(EmailTemplates.invitation, {
  recipientEmail: user.email,
  inviteLink: link,
  lang: user.language
})
```

### 3. Type Safety
```typescript
interface InvitationEmailData {
  recipientEmail: string
  firstName: string
  ownerName: string
  organizationName: string
  inviteLink: string
  lang: 'en' | 'fr'
}

// TypeScript enforces all required fields
```

### 4. Testability
- Unit test templates independently
- Mock email delivery service
- Visual regression testing for emails

### 5. Multi-tenancy Ready
- Each app can have custom templates
- Shared base templates
- Override specific templates per app

### 6. Localization
- Centralized translation strings
- Consistent terminology across emails/alerts
- Easy to add new languages

## Example Implementations

### Alert Page Component

```vue
<!-- packages/messaging/components/AlertPage.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full text-center">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Icon slot -->
        <div class="w-16 h-16 mx-auto mb-4">
          <slot name="icon">
            <div :class="iconClasses" class="w-full h-full rounded-full flex items-center justify-center">
              <i :class="[defaultIcon, iconColor, 'text-2xl']"></i>
            </div>
          </slot>
        </div>
        
        <!-- Title -->
        <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
          <slot name="title">{{ title }}</slot>
        </h2>
        
        <!-- Message -->
        <p class="text-gray-600 mb-6">
          <slot name="message">{{ message }}</slot>
        </p>
        
        <!-- Action slot -->
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type AlertType = 'loading' | 'error' | 'success' | 'info'

interface Props {
  type?: AlertType
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info'
})

const iconClasses = computed(() => ({
  'loading': 'border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin',
  'error': 'bg-red-100',
  'success': 'bg-green-100',
  'info': 'bg-blue-100'
}[props.type]))

const defaultIcon = computed(() => ({
  'loading': '',
  'error': 'fa-solid fa-exclamation-triangle',
  'success': 'fa-solid fa-check-circle',
  'info': 'fa-solid fa-info-circle'
}[props.type]))

const iconColor = computed(() => ({
  'loading': '',
  'error': 'text-red-600',
  'success': 'text-green-600',
  'info': 'text-blue-600'
}[props.type]))
</script>
```

### Usage in SSO Login

```vue
<!-- app/pages/sso/login.vue -->
<template>
  <AlertPage 
    v-if="loading"
    type="loading"
    :title="t('auth.sso.connecting')"
    :message="t('auth.sso.generatingToken')"
  />
  
  <AlertPage 
    v-else-if="error"
    type="error"
    :title="t('auth.sso.required')"
    :message="error"
  >
    <template #action>
      <NuxtLink 
        :to="`/signin?redirect=${encodeURIComponent(redirectPath)}`"
        class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
      >
        {{ t('auth.signIn') }}
      </NuxtLink>
    </template>
  </AlertPage>
</template>
```

### Email Template Example

```typescript
// packages/messaging/templates/emails/invitation.ts
import { BaseEmailTemplate, EmailTemplateData } from './base'

export interface InvitationEmailData extends EmailTemplateData {
  firstName: string
  ownerName: string
  organizationName: string
  inviteLink: string
  role: string
}

export class InvitationTemplate extends BaseEmailTemplate<InvitationEmailData> {
  getSubject(data: InvitationEmailData): string {
    return this.t('emails.invitation.subject', { 
      accountName: data.organizationName 
    })
  }
  
  renderBody(data: InvitationEmailData): string {
    return `
      <h1>${this.t('emails.invitation.greeting', { firstName: data.firstName })}</h1>
      <p>${this.t('emails.invitation.invitedBy', { 
        ownerName: data.ownerName, 
        accountName: data.organizationName 
      })}</p>
      <a href="${data.inviteLink}" class="button">
        ${this.t('emails.invitation.acceptButton')}
      </a>
      <p class="footnote">${this.t('emails.invitation.linkExpires')}</p>
    `
  }
}
```

## Migration Path

### Step 1: No Breaking Changes
- Create package alongside existing code
- Dual implementation during migration
- Test thoroughly in staging

### Step 2: Gradual Migration
- Migrate one template at a time
- Update one endpoint at a time
- Feature flag new system

### Step 3: Cleanup
- Remove old email code
- Archive deprecated files
- Update documentation

## Recommendations

### Immediate (This Sprint)
1. ✅ Create `packages/messaging` folder structure
2. ✅ Build AlertPage base component
3. ✅ Update SSO login page to use AlertPage
4. Move email templates to package

### Short Term (Next 2 Weeks)
1. Centralize all Praxio emails
2. Create email service abstraction
3. Add comprehensive i18n for messages

### Medium Term (Next Month)
1. Integrate with Retroact
2. Build email preview tool
3. Add email analytics

### Long Term (Future)
1. Visual email builder
2. SMS support
3. Push notifications
4. Webhook integrations

## Questions to Consider

1. **Email Provider**: Continue with Firebase Extension or switch to SendGrid/Resend?
2. **Branding**: Same branding for all apps or allow customization?
3. **Versioning**: How to version templates for backwards compatibility?
4. **Testing**: Unit tests? Visual regression? Email delivery tests?
5. **Monitoring**: How to track email delivery failures?

## Next Steps

Would you like me to:
1. Create the base AlertPage component?
2. Start the messaging package structure?
3. Create email template interfaces?
4. Plan the migration timeline in detail?
