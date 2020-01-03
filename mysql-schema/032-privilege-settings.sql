SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (32, UNIX_TIMESTAMP());

CREATE TABLE privileges (
  privilege VARCHAR(200) NOT NULL PRIMARY KEY,
  description VARCHAR(2000) NOT NULL
);

INSERT INTO privileges (privilege, description) VALUES ('admin', 'Full admin privileges on the authenciation server');

COMMIT;