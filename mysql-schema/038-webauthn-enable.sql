SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (38, UNIX_TIMESTAMP());

INSERT INTO server_settings (setting, value) VALUES
  ('registration.mfa.enabled', 'true')
  ON DUPLICATE KEY UPDATE value = 'true';

INSERT INTO server_settings (setting, value) VALUES
  ('webauthn', '"enabled"')
  ON DUPLICATE KEY UPDATE value = '"enabled"';


UPDATE server_settings SET value = NULL WHERE setting 
  IN ('webauthn.relyingPartyId', 'webauthn.expectedOrigin');

COMMIT;
