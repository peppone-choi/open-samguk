-- Create databases for parity testing
CREATE DATABASE IF NOT EXISTS sammo_common CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE DATABASE IF NOT EXISTS sammo_game CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Grant permissions
GRANT ALL PRIVILEGES ON sammo_common.* TO 'sammo'@'%';
GRANT ALL PRIVILEGES ON sammo_game.* TO 'sammo'@'%';
FLUSH PRIVILEGES;
