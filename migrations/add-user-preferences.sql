-- Add preferences JSON column to users table
-- This will store cross-app settings like language preference

ALTER TABLE users ADD COLUMN preferences JSON DEFAULT NULL;

-- Add index for faster preferences queries
CREATE INDEX idx_users_preferences ON users(userId);

-- Update existing users to have default language preference (English)
UPDATE users SET preferences = JSON_OBJECT('language', 'en') WHERE preferences IS NULL;
