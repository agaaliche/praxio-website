-- Track which broadcasts users have dismissed/seen
CREATE TABLE IF NOT EXISTS dismissed_broadcasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    broadcast_id INT NOT NULL,
    dismissed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_broadcast (user_id, broadcast_id),
    FOREIGN KEY (broadcast_id) REFERENCES admin_broadcasts (id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_broadcast_id (broadcast_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;