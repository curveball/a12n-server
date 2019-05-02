SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (24, UNIX_TIMESTAMP());

INSERT INTO server_settings (setting, value) VALUES ('registration.enabled', 'true');

COMMIT;
