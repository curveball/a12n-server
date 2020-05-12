SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (34, UNIX_TIMESTAMP());

ALTER TABLE oauth2_codes
  ADD COLUMN  code_challenge VARCHAR(50) NULL AFTER user_id,
  ADD COLUMN  code_challenge_method VARCHAR(50) NULL AFTER code_challenge;

COMMIT;