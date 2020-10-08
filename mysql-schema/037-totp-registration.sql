SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (37, UNIX_TIMESTAMP());

INSERT INTO server_settings (setting, value) VALUES ('totp.serviceName', '"Authentication API"');

ALTER TABLE user_totp
  ADD created INT UNSIGNED NOT NULL DEFAULT '0';

COMMIT;