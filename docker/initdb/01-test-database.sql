-- Runs once, when the Postgres volume is created (docker-entrypoint-initdb.d).
-- Integration and end-to-end tests use this database, never the development one.
CREATE DATABASE pack_test;
