
-- This file contains the SQL schema for the PostgreSQL database
-- Execute these commands in your PostgreSQL database to set up the required tables

-- Drop tables if they exist
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS poc_team;
DROP TABLE IF EXISTS poc_tags;
DROP TABLE IF EXISTS pocs;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS customers;

-- Create employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  work_extension VARCHAR(50),
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  avatar VARCHAR(255),
  skills TEXT[],
  certificates TEXT[],
  location VARCHAR(50),
  status VARCHAR(50),
  job_title VARCHAR(100)
);

-- Create customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  organization_type VARCHAR(50) NOT NULL
);

-- Create pocs (Proof of Concepts) table with updated fields
CREATE TABLE pocs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(100) NOT NULL,
  technology VARCHAR(100) NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  lead_id INTEGER REFERENCES employees(id),
  account_manager_id INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  end_time TIMESTAMP, -- Added end_time field to match the endTime property
  comments TEXT[]
);

-- Create poc_tags table for tags
CREATE TABLE poc_tags (
  poc_id INTEGER REFERENCES pocs(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (poc_id, tag_name)
);

-- Create poc_team table for team members
CREATE TABLE poc_team (
  poc_id INTEGER REFERENCES pocs(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY (poc_id, employee_id)
);

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  poc_id INTEGER REFERENCES pocs(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  author_id INTEGER REFERENCES employees(id)
);

-- Insert sample data for employees
INSERT INTO employees (name, email, phone, work_extension, role, department, avatar, skills, certificates, location, status, job_title)
VALUES 
  ('Jane Smith', 'jane.smith@company.com', '555-123-4567', '1234', 'admin', 'Engineering', 'https://i.pravatar.cc/150?img=1', ARRAY['React', 'TypeScript', 'Node.js'], ARRAY['AWS Certified Developer', 'Scrum Master'], 'in-office', 'active', 'Senior Developer'),
  ('John Doe', 'john.doe@company.com', '555-987-6543', '4321', 'lead', 'Engineering', 'https://i.pravatar.cc/150?img=2', ARRAY['JavaScript', 'React', 'Python'], ARRAY['Azure Developer Associate'], 'remote', 'active', 'Team Lead'),
  ('Alice Johnson', 'alice@company.com', NULL, NULL, 'developer', 'Engineering', 'https://i.pravatar.cc/150?img=3', NULL, NULL, NULL, NULL, NULL),
  ('Bob Brown', 'bob@company.com', NULL, NULL, 'developer', 'Engineering', 'https://i.pravatar.cc/150?img=4', NULL, NULL, NULL, NULL, NULL),
  ('Carol Williams', 'carol@company.com', NULL, NULL, 'account_manager', 'Sales', 'https://i.pravatar.cc/150?img=5', NULL, NULL, NULL, NULL, NULL);

-- Insert sample customers
INSERT INTO customers (name, contact_person, contact_email, contact_phone, industry, organization_type)
VALUES 
  ('Acme Corporation', 'Wile E. Coyote', 'wcoyote@acme.com', '555-123-4567', 'Manufacturing', 'private'),
  ('Wayne Enterprises', 'Bruce Wayne', 'bruce@wayne.com', '555-876-5432', 'Technology', 'private'),
  ('City of Metropolis', 'Mayor Office', 'mayor@metropolis.gov', '555-789-0123', 'Government', 'governmental');

-- Insert sample pocs with updated structure including end_time
INSERT INTO pocs (title, description, status, technology, customer_id, lead_id, account_manager_id, start_date, end_date, end_time)
VALUES 
  ('AI-Powered Customer Service Bot', 'Develop a proof of concept for an AI chatbot that can handle basic customer service inquiries.', 'in progress', 'AppDynamics', 1, 2, 5, '2023-01-15', '2023-06-15', '2023-06-15T17:00:00Z'),
  ('Blockchain-based Document Verification', 'Create a POC for verifying document authenticity using blockchain technology.', 'Account Manager coordinated with Tech Lead', 'security', 2, 1, 5, '2023-03-05', NULL, NULL),
  ('IoT Fleet Management System', 'Develop a system for tracking and managing delivery vehicles using IoT sensors.', 'done', 'wireless', 3, 2, 5, '2022-10-20', '2023-02-28', '2023-02-28T15:30:00Z');

-- Insert sample poc tags
INSERT INTO poc_tags (poc_id, tag_name)
VALUES 
  (1, 'AI'),
  (1, 'Customer Service'),
  (1, 'Chatbot'),
  (2, 'Blockchain'),
  (2, 'Document Verification'),
  (2, 'Security'),
  (3, 'IoT'),
  (3, 'Fleet Management'),
  (3, 'Logistics');

-- Insert sample poc team members
INSERT INTO poc_team (poc_id, employee_id)
VALUES 
  (1, 1),
  (1, 3),
  (1, 4),
  (2, 2),
  (2, 4),
  (3, 1),
  (3, 3);

-- Insert sample comments
INSERT INTO comments (poc_id, text, author_id, created_at)
VALUES 
  (1, 'Initial prototype completed, moving to testing phase.', 2, '2023-02-01T09:15:00Z'),
  (1, 'Testing phase showing promising results. Need to improve response accuracy.', 3, '2023-03-10T11:20:00Z'),
  (2, 'Project proposal approved. Starting requirements gathering.', 1, '2023-03-05T09:30:00Z'),
  (3, 'All features implemented and tested. Ready for client demo.', 2, '2023-02-15T10:45:00Z'),
  (3, 'Client demo successful. POC approved for production development.', 5, '2023-02-28T15:10:00Z');
