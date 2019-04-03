SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (17, UNIX_TIMESTAMP());

-- This patch breaks some MySQL servers. A new version has
-- created as patch 21

-- ALTER TABLE oauth2_tokens
--   CHANGE access_token access_token VARCHAR(2000) NOT NULL UNIQUE;

COMMIT;
