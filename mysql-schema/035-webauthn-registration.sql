SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (35, UNIX_TIMESTAMP());

CREATE TABLE user_webauthn (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  credential_id VARCHAR(2000) NOT NULL,
  public_key VARCHAR(2000) NOT NULL,
  counter INT UNSIGNED NOT NULL,
  created INT UNSIGNED NOT NULL
);

INSERT INTO server_settings (setting, value) VALUES
('registration.mfa.enabled', 'false'),
('webauthn.relyingPartyId', '"localhost"'),
('webauthn.expectedOrigin', '"http://localhost:8531"'),
('webauthn.serviceName', '"Authentication API"');

COMMIT;