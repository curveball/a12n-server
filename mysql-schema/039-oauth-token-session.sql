SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (39, UNIX_TIMESTAMP());

ALTER TABLE oauth2_tokens
  ADD browser_session_id VARCHAR(200) NULL;

ALTER TABLE oauth2_codes
  ADD browser_session_id VARCHAR(200) NULL;

COMMIT;
