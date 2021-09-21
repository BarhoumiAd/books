CREATE SCHEMA demo;
CREATE TABLE demo.book(id uuid PRIMARY KEY, title text NOT NULL, author text NOT NULL, description text);