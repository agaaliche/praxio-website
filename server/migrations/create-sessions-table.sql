-- Create sessions table for tracking user login sessions
-- Run this migration to enable the active sessions feature

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessionId VARCHAR(64) NOT NULL UNIQUE,
  userId VARCHAR(128) NOT NULL,
  deviceName VARCHAR(255),
  deviceType VARCHAR(50),
  browser VARCHAR(100),
  browserVersion VARCHAR(50),
  os VARCHAR(100),
  ipAddress VARCHAR(45),
  userAgent TEXT,
  loginTime DATETIME NOT NULL,
  lastActiveTime DATETIME NOT NULL,
  isRevoked BOOLEAN DEFAULT FALSE,
  revokedAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_sessionId (sessionId),
  INDEX idx_lastActiveTime (lastActiveTime),
  INDEX idx_isRevoked (isRevoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
