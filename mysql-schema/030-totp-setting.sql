SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (30, UNIX_TIMESTAMP());

INSERT INTO server_settings (setting, value) VALUES ('totp', '"optional"');

COMMIT;
