SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (36, UNIX_TIMESTAMP());

INSERT INTO server_settings (setting, value) VALUES ('webauthn', '"disabled"');

COMMIT;