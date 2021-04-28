SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (42, UNIX_TIMESTAMP());

RENAME TABLE users to principals;
ALTER TABLE principals 
  CHANGE created created_at BIGINT NOT NULL,
  ADD modified_at BIGINT NOT NULL;

UPDATE principals SET created_at = created_at * 1000, modified_at = UNIX_TIMESTAMP()*1000;

COMMIT;
