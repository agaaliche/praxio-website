# Setup Updates for Other Dev Machines

## Database Migrations Required

After pulling these changes, run the following SQL migrations in order:

### 1. Admin Messaging System
```bash
mysql -u root -p -P 3307 master < migrations/add-admin-messaging.sql
```

This creates:
- `admin_messages` table (direct messages to specific users)
- `admin_broadcasts` table (broadcast messages to user groups)

### 2. Dismissed Broadcasts Tracking
```bash
mysql -u root -p -P 3307 master < migrations/add-dismissed-broadcasts.sql
```

This creates:
- `dismissed_broadcasts` table (tracks which users dismissed which broadcasts)

## Database Password
Use password: `SecurePass2025!`

## New Features Added

### 1. Notification System
- **Components**: MessageSnackbar, MessageDialog, NotificationPanel
- **API Endpoints**: 
  - `GET /api/messages/inbox` - Unread messages
  - `GET /api/messages/all` - All messages (last 7 days)
  - `PATCH /api/messages/[id]` - Mark as read
  - `DELETE /api/messages/[id]` - Delete message
  - `POST /api/messages/[id]/dismiss` - Dismiss broadcast
- **Features**:
  - Auto-popup notifications for new messages (snackbar or dialog)
  - Notification panel (Firebase console style) in user dropdown
  - Red dot indicator on avatar when unread messages exist
  - 30-second polling for new messages
  - LocalStorage tracking to prevent re-showing messages

### 2. Admin Messaging System
- Send direct messages to specific users
- Broadcast messages to groups (all, online, trial, paid)
- Message type: snackbar (auto-dismiss) or dialog (requires action)
- Message history view

### 3. Admin Features Enhanced
- **Online Users**: Now uses sessions table instead of Firebase lastSignInTime (15-minute activity window)
- **Impersonation**: 
  - Fixed to work correctly with Firebase custom tokens
  - Added red banner at top when impersonating
  - "Exit Impersonation" button returns to admin
- **Tickets System**: Complete support ticket management (user + admin sides)
- **Changelog**: Git commit viewer in admin panel

### 4. UI Improvements
- Custom scrollbar styling (VS Code-style, matching overlay scrollbar in retroact.vue)
- Fixed header shadow behavior (no shadow on admin/account pages with level 2 nav)
- Notification panel hides main scrollbar when open (cleaner look)

### 5. Rate Limiting
- New rate limiting utility for all admin endpoints
- Protects against abuse with configurable limits per action type

## Verification Steps

After pulling and running migrations:

1. **Check Database Tables**:
```bash
mysql -u root -p -P 3307 -e "USE master; SHOW TABLES LIKE 'admin_%'; SHOW TABLES LIKE 'dismissed_broadcasts';"
```

2. **Test Notification System**:
   - Login as admin
   - Go to Admin → Messaging
   - Send a test message to yourself
   - Check for notification popup and red dot on avatar

3. **Test Impersonation**:
   - Go to Admin → Impersonate
   - Select a user and impersonate
   - Verify red banner appears at top
   - Click "Exit Impersonation" to return

4. **Test Online Users**:
   - Go to Admin → Online
   - Should show users active in last 15 minutes (based on sessions table)

## Dependencies

No new npm packages required. All features use existing dependencies.

## Breaking Changes

None. All changes are additive.

## Notes

- The `sessions` table must exist for online users to work correctly (should already be in your database)
- Custom scrollbar styling is applied globally via CSS
- Impersonation uses localStorage flags to track state
- Message polling starts automatically when user is authenticated
