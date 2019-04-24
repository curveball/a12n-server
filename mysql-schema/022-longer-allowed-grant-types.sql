SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (22, UNIX_TIMESTAMP());

ALTER TABLE oauth2_clients
  CHANGE allowed_grant_types allowed_grant_types VARCHAR(69) NOT NULL;

COMMIT;
