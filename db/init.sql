-- Customer Notes — database schema + seed data
-- Runs automatically on first `docker compose up`
-- Database: test  /  User: test  /  Password: test

CREATE TABLE IF NOT EXISTS customers (
  id          VARCHAR(50)                          NOT NULL PRIMARY KEY,
  name        VARCHAR(255)                         NOT NULL,
  phone       VARCHAR(50)                          NOT NULL,
  email       VARCHAR(255)                         NOT NULL,
  company     VARCHAR(255)                         NOT NULL,
  status      ENUM('active', 'lead', 'inactive')   NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP                            NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id           VARCHAR(50)   NOT NULL PRIMARY KEY,
  customer_id  VARCHAR(50)   NOT NULL,
  text         TEXT          NOT NULL,
  author       VARCHAR(255)  NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ticket_statuses (
  id     VARCHAR(50)   NOT NULL PRIMARY KEY,
  name   VARCHAR(100)  NOT NULL,
  color  VARCHAR(50)   NOT NULL
);

-- Seed customers
INSERT INTO customers (id, name, phone, email, company, status) VALUES
  ('cust_001', 'Sarah Chen',       '415-555-0123', 'sarah@acme.com',      'Acme Corp',    'active'),
  ('cust_002', 'Marcus Rodriguez', '310-555-0456', 'marcus@techstart.io', 'TechStart Inc','active'),
  ('cust_003', 'Priya Patel',      '646-555-0789', 'priya@novatech.dev',  'Nova Tech',    'lead');

-- Seed notes
INSERT INTO notes (id, customer_id, text, author, created_at) VALUES
  ('note_001', 'cust_001', 'Discussed upgrading to enterprise plan. Very interested in AI features.', 'Alex Rivera',  '2025-05-15 10:30:00'),
  ('note_002', 'cust_001', 'Follow-up call scheduled for next Tuesday.',                              'Alex Rivera',  '2025-05-16 14:15:00'),
  ('note_003', 'cust_002', 'Onboarding completed. Client is happy with initial setup.',               'Jordan Kim',   '2025-05-14 09:45:00');

-- Seed ticket statuses
INSERT INTO ticket_statuses (id, name, color) VALUES
  ('status_1', 'Open',                'blue'),
  ('status_2', 'In Progress',         'yellow'),
  ('status_3', 'Waiting on Customer', 'orange'),
  ('status_4', 'Resolved',            'green'),
  ('status_5', 'Closed',              'gray');

