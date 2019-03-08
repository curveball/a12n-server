SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (10, UNIX_TIMESTAMP());

CREATE TABLE user_privileges (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  privilege VARCHAR(50) NOT NULL
);

INSERT INTO user_privileges (user_id, privilege) SELECT user_id, permission from user_permissions;
DROP TABLE user_permissions;

COMMIT;
