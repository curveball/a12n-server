SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO changelog VALUES (5, UNIX_TIMESTAMP());

CREATE TABLE oauth2_redirect_uris (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  oauth2_client_id INT UNSIGNED NOT NULL,
  uri VARCHAR(300) NOT NULL
);

INSERT INTO oauth2_redirect_uris (oauth2_client_id, uri) SELECT oauth2_client_id, url FROM oauth2_redirection_urls;

DROP TABLE oauth2_redirection_urls;

COMMIT;
