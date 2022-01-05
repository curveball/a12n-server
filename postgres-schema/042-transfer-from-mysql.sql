--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO root;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: changelog; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.changelog (
    id bigint NOT NULL,
    "timestamp" bigint
);

INSERT INTO auth.changelog VALUES (42, UNIX_TIMESTAMP());

ALTER TABLE auth.changelog OWNER TO root;

--
-- Name: group_members; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.group_members (
    user_id bigint NOT NULL,
    group_id bigint NOT NULL
);


ALTER TABLE auth.group_members OWNER TO root;

--
-- Name: oauth2_clients; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.oauth2_clients (
    id bigint NOT NULL,
    client_id character varying(50) NOT NULL,
    client_secret character varying(60) NOT NULL,
    allowed_grant_types character varying(69) NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE auth.oauth2_clients OWNER TO root;

--
-- Name: oauth2_clients_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.oauth2_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.oauth2_clients_id_seq OWNER TO root;

--
-- Name: oauth2_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.oauth2_clients_id_seq OWNED BY auth.oauth2_clients.id;


--
-- Name: oauth2_codes; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.oauth2_codes (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    code character varying(50) NOT NULL,
    user_id bigint NOT NULL,
    code_challenge character varying(50),
    code_challenge_method character varying(50),
    created bigint NOT NULL,
    browser_session_id character varying(200)
);


ALTER TABLE auth.oauth2_codes OWNER TO root;

--
-- Name: oauth2_codes_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.oauth2_codes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.oauth2_codes_id_seq OWNER TO root;

--
-- Name: oauth2_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.oauth2_codes_id_seq OWNED BY auth.oauth2_codes.id;


--
-- Name: oauth2_redirect_uris; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.oauth2_redirect_uris (
    id bigint NOT NULL,
    oauth2_client_id bigint NOT NULL,
    uri character varying(300) NOT NULL
);


ALTER TABLE auth.oauth2_redirect_uris OWNER TO root;

--
-- Name: oauth2_redirect_uris_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.oauth2_redirect_uris_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.oauth2_redirect_uris_id_seq OWNER TO root;

--
-- Name: oauth2_redirect_uris_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.oauth2_redirect_uris_id_seq OWNED BY auth.oauth2_redirect_uris.id;


--
-- Name: oauth2_tokens; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.oauth2_tokens (
    id bigint NOT NULL,
    oauth2_client_id bigint NOT NULL,
    access_token character varying(2000),
    refresh_token character varying(50) NOT NULL,
    user_id bigint NOT NULL,
    access_token_expires bigint NOT NULL,
    refresh_token_expires bigint NOT NULL,
    created bigint NOT NULL,
    browser_session_id character varying(200)
);


ALTER TABLE auth.oauth2_tokens OWNER TO root;

--
-- Name: oauth2_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.oauth2_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.oauth2_tokens_id_seq OWNER TO root;

--
-- Name: oauth2_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.oauth2_tokens_id_seq OWNED BY auth.oauth2_tokens.id;


--
-- Name: principals; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.principals (
    id bigint NOT NULL,
    identity character varying(200) NOT NULL,
    nickname character varying(100),
    created_at bigint NOT NULL,
    active boolean DEFAULT false NOT NULL,
    type smallint DEFAULT '1'::smallint NOT NULL,
    modified_at bigint NOT NULL
);


ALTER TABLE auth.principals OWNER TO root;

--
-- Name: COLUMN principals.type; Type: COMMENT; Schema: auth; Owner: root
--

COMMENT ON COLUMN auth.principals.type IS '1 = user, 2 = app';


--
-- Name: principals_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.principals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.principals_id_seq OWNER TO root;

--
-- Name: principals_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.principals_id_seq OWNED BY auth.principals.id;


--
-- Name: privileges; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.privileges (
    privilege character varying(200) NOT NULL,
    description character varying(2000) NOT NULL
);


ALTER TABLE auth.privileges OWNER TO root;

--
-- Name: reset_password_token; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.reset_password_token (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(100) NOT NULL,
    expires_at bigint NOT NULL,
    created_at bigint NOT NULL
);


ALTER TABLE auth.reset_password_token OWNER TO root;

--
-- Name: reset_password_token_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.reset_password_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.reset_password_token_id_seq OWNER TO root;

--
-- Name: reset_password_token_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.reset_password_token_id_seq OWNED BY auth.reset_password_token.id;


--
-- Name: server_settings; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.server_settings (
    setting character varying(200) NOT NULL,
    value character varying(2000)
);


ALTER TABLE auth.server_settings OWNER TO root;

--
-- Name: user_log; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.user_log (
    id bigint NOT NULL,
    "time" bigint NOT NULL,
    user_id bigint,
    event_type smallint NOT NULL,
    ip character varying(45) NOT NULL,
    user_agent text,
    country character varying(2)
);


ALTER TABLE auth.user_log OWNER TO root;

--
-- Name: user_log_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.user_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.user_log_id_seq OWNER TO root;

--
-- Name: user_log_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.user_log_id_seq OWNED BY auth.user_log.id;


--
-- Name: user_passwords; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.user_passwords (
    user_id bigint NOT NULL,
    password bytea NOT NULL
);


ALTER TABLE auth.user_passwords OWNER TO root;

--
-- Name: user_passwords_user_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.user_passwords_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.user_passwords_user_id_seq OWNER TO root;

--
-- Name: user_passwords_user_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.user_passwords_user_id_seq OWNED BY auth.user_passwords.user_id;


--
-- Name: user_privileges; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.user_privileges (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    resource character varying(255) DEFAULT '*'::character varying NOT NULL,
    privilege character varying(50) NOT NULL
);


ALTER TABLE auth.user_privileges OWNER TO root;

--
-- Name: user_privileges_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.user_privileges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.user_privileges_id_seq OWNER TO root;

--
-- Name: user_privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.user_privileges_id_seq OWNED BY auth.user_privileges.id;


--
-- Name: user_totp; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.user_totp (
    user_id bigint NOT NULL,
    secret character varying(50),
    failures smallint DEFAULT '0'::smallint NOT NULL,
    created bigint DEFAULT '0'::bigint NOT NULL
);


ALTER TABLE auth.user_totp OWNER TO root;

--
-- Name: user_totp_user_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.user_totp_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.user_totp_user_id_seq OWNER TO root;

--
-- Name: user_totp_user_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.user_totp_user_id_seq OWNED BY auth.user_totp.user_id;


--
-- Name: user_webauthn; Type: TABLE; Schema: auth; Owner: root
--

CREATE TABLE auth.user_webauthn (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    credential_id character varying(2000) NOT NULL,
    public_key character varying(2000) NOT NULL,
    counter bigint NOT NULL,
    created bigint NOT NULL
);


ALTER TABLE auth.user_webauthn OWNER TO root;

--
-- Name: user_webauthn_id_seq; Type: SEQUENCE; Schema: auth; Owner: root
--

CREATE SEQUENCE auth.user_webauthn_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.user_webauthn_id_seq OWNER TO root;

--
-- Name: user_webauthn_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: root
--

ALTER SEQUENCE auth.user_webauthn_id_seq OWNED BY auth.user_webauthn.id;


--
-- Name: oauth2_clients id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_clients ALTER COLUMN id SET DEFAULT nextval('auth.oauth2_clients_id_seq'::regclass);


--
-- Name: oauth2_codes id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_codes ALTER COLUMN id SET DEFAULT nextval('auth.oauth2_codes_id_seq'::regclass);


--
-- Name: oauth2_redirect_uris id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_redirect_uris ALTER COLUMN id SET DEFAULT nextval('auth.oauth2_redirect_uris_id_seq'::regclass);


--
-- Name: oauth2_tokens id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_tokens ALTER COLUMN id SET DEFAULT nextval('auth.oauth2_tokens_id_seq'::regclass);


--
-- Name: principals id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.principals ALTER COLUMN id SET DEFAULT nextval('auth.principals_id_seq'::regclass);


--
-- Name: reset_password_token id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.reset_password_token ALTER COLUMN id SET DEFAULT nextval('auth.reset_password_token_id_seq'::regclass);


--
-- Name: user_log id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_log ALTER COLUMN id SET DEFAULT nextval('auth.user_log_id_seq'::regclass);


--
-- Name: user_passwords user_id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_passwords ALTER COLUMN user_id SET DEFAULT nextval('auth.user_passwords_user_id_seq'::regclass);


--
-- Name: user_privileges id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_privileges ALTER COLUMN id SET DEFAULT nextval('auth.user_privileges_id_seq'::regclass);


--
-- Name: user_totp user_id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_totp ALTER COLUMN user_id SET DEFAULT nextval('auth.user_totp_user_id_seq'::regclass);


--
-- Name: user_webauthn id; Type: DEFAULT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_webauthn ALTER COLUMN id SET DEFAULT nextval('auth.user_webauthn_id_seq'::regclass);


--
-- Name: oauth2_clients_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.oauth2_clients_id_seq', 3, true);


--
-- Name: oauth2_codes_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.oauth2_codes_id_seq', 1365, true);


--
-- Name: oauth2_redirect_uris_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.oauth2_redirect_uris_id_seq', 6, true);


--
-- Name: oauth2_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.oauth2_tokens_id_seq', 2300, true);


--
-- Name: principals_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.principals_id_seq', 179, true);


--
-- Name: reset_password_token_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.reset_password_token_id_seq', 1, true);


--
-- Name: user_log_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.user_log_id_seq', 1603, true);


--
-- Name: user_passwords_user_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.user_passwords_user_id_seq', 179, true);


--
-- Name: user_privileges_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.user_privileges_id_seq', 842, true);


--
-- Name: user_totp_user_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.user_totp_user_id_seq', 98, true);


--
-- Name: user_webauthn_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: root
--

SELECT pg_catalog.setval('auth.user_webauthn_id_seq', 1, true);


--
-- Name: changelog idx_16762_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.changelog
    ADD CONSTRAINT idx_16762_primary PRIMARY KEY (id);


--
-- Name: group_members idx_16765_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.group_members
    ADD CONSTRAINT idx_16765_primary PRIMARY KEY (user_id, group_id);


--
-- Name: oauth2_clients idx_16770_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_clients
    ADD CONSTRAINT idx_16770_primary PRIMARY KEY (id);


--
-- Name: oauth2_codes idx_16776_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_codes
    ADD CONSTRAINT idx_16776_primary PRIMARY KEY (id);


--
-- Name: oauth2_redirect_uris idx_16782_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_redirect_uris
    ADD CONSTRAINT idx_16782_primary PRIMARY KEY (id);


--
-- Name: oauth2_tokens idx_16788_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.oauth2_tokens
    ADD CONSTRAINT idx_16788_primary PRIMARY KEY (id);


--
-- Name: principals idx_16797_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.principals
    ADD CONSTRAINT idx_16797_primary PRIMARY KEY (id);


--
-- Name: privileges idx_16803_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.privileges
    ADD CONSTRAINT idx_16803_primary PRIMARY KEY (privilege);


--
-- Name: reset_password_token idx_16811_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.reset_password_token
    ADD CONSTRAINT idx_16811_primary PRIMARY KEY (id);


--
-- Name: server_settings idx_16815_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.server_settings
    ADD CONSTRAINT idx_16815_primary PRIMARY KEY (setting);


--
-- Name: user_log idx_16823_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_log
    ADD CONSTRAINT idx_16823_primary PRIMARY KEY (id);


--
-- Name: user_passwords idx_16832_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_passwords
    ADD CONSTRAINT idx_16832_primary PRIMARY KEY (user_id);


--
-- Name: user_privileges idx_16841_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_privileges
    ADD CONSTRAINT idx_16841_primary PRIMARY KEY (id);


--
-- Name: user_totp idx_16848_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_totp
    ADD CONSTRAINT idx_16848_primary PRIMARY KEY (user_id);


--
-- Name: user_webauthn idx_16856_primary; Type: CONSTRAINT; Schema: auth; Owner: root
--

ALTER TABLE ONLY auth.user_webauthn
    ADD CONSTRAINT idx_16856_primary PRIMARY KEY (id);


--
-- Name: idx_16770_client_id; Type: INDEX; Schema: auth; Owner: root
--

CREATE UNIQUE INDEX idx_16770_client_id ON auth.oauth2_clients USING btree (client_id);


--
-- Name: idx_16788_access_token; Type: INDEX; Schema: auth; Owner: root
--

CREATE UNIQUE INDEX idx_16788_access_token ON auth.oauth2_tokens USING btree (access_token);


--
-- Name: idx_16788_refresh_token; Type: INDEX; Schema: auth; Owner: root
--

CREATE UNIQUE INDEX idx_16788_refresh_token ON auth.oauth2_tokens USING btree (refresh_token);


--
-- Name: idx_16797_identity; Type: INDEX; Schema: auth; Owner: root
--

CREATE UNIQUE INDEX idx_16797_identity ON auth.principals USING btree (identity);


--
-- Name: idx_16811_token; Type: INDEX; Schema: auth; Owner: root
--

CREATE UNIQUE INDEX idx_16811_token ON auth.reset_password_token USING btree (token);


--
-- Name: idx_16848_user_id; Type: INDEX; Schema: auth; Owner: root
--

CREATE UNIQUE INDEX idx_16848_user_id ON auth.user_totp USING btree (user_id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: root
--

REVOKE ALL ON SCHEMA public FROM rdsadmin;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO root;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

