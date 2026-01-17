-- Add admin messaging tables

CREATE TABLE IF NOT EXISTS admin_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_uid VARCHAR(128) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'snackbar', -- 'snackbar' or 'dialog'
    title VARCHAR(255) DEFAULT '',
    message TEXT NOT NULL,
    sent_by VARCHAR(128) NOT NULL,
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target_uid (target_uid),
    INDEX idx_created_at (created_at),
    INDEX idx_read_at (read_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_broadcasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'snackbar', -- 'snackbar' or 'dialog'
    title VARCHAR(255) DEFAULT '',
    message TEXT NOT NULL,
    target VARCHAR(50) NOT NULL DEFAULT 'all', -- 'all', 'online', 'trial', 'paid'
    sent_by VARCHAR(128) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target (target),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Message history view combining both tables
CREATE OR REPLACE VIEW admin_message_history AS
SELECT
    'direct' as type,
    id,
    target_uid as target,
    message,
    sent_by,
    created_at
FROM admin_messages
UNION ALL
SELECT
    'broadcast' as type,
    id,
    target,
    message,
    sent_by,
    created_at
FROM admin_broadcasts
ORDER BY created_at DESC
LIMIT 100;