SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (31, UNIX_TIMESTAMP());

INSERT INTO server_settings (setting, value) VALUES
('oauth2.accessToken.expiry', 600),
('oauth2.refreshToken.expiry', 21600),
('oauth2.code.expiry', 600);
COMMIT;
