-- Create sessions table for managing user login sessions
CREATE TABLE IF NOT EXISTS sessions (
  sessionId VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  deviceName VARCHAR(255),
  deviceType VARCHAR(100),
  browser VARCHAR(100),
  browserVersion VARCHAR(50),
  os VARCHAR(100),
  ipAddress VARCHAR(45),
  userAgent TEXT,
  loginTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastActiveTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  isRevoked BOOLEAN DEFAULT FALSE,
  revokedAt TIMESTAMP NULL,
  INDEX idx_userId (userId),
  INDEX idx_isRevoked (isRevoked),
  INDEX idx_lastActiveTime (lastActiveTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
