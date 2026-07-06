CREATE DATABASE IF NOT EXISTS support_ticket_db;
USE support_ticket_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'SUPPORT_AGENT', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  assigned_agent_id INT NULL,
  ticket_title VARCHAR(200) NOT NULL,
  ticket_description TEXT NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  category VARCHAR(100) NOT NULL,
  status ENUM('Open', 'In Progress', 'On Hold', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ticket_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sla_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL UNIQUE,
  response_deadline DATETIME NOT NULL,
  resolution_deadline DATETIME NOT NULL,
  breached_status ENUM('None', 'Response Breached', 'Resolution Breached', 'Both Breached') NOT NULL DEFAULT 'None',
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity VARCHAR(255) NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed users (password: password123 for all)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@support.com', '$2a$10$rt7KGLp9T4mqZwJir1cL1eM6TwONH2m6bIN3hp6s3D/xTHeRkWmdu', 'ADMIN'),
('Agent Smith', 'agent@support.com', '$2a$10$rt7KGLp9T4mqZwJir1cL1eM6TwONH2m6bIN3hp6s3D/xTHeRkWmdu', 'SUPPORT_AGENT'),
('Agent Johnson', 'agent2@support.com', '$2a$10$rt7KGLp9T4mqZwJir1cL1eM6TwONH2m6bIN3hp6s3D/xTHeRkWmdu', 'SUPPORT_AGENT'),
('John Customer', 'customer@support.com', '$2a$10$rt7KGLp9T4mqZwJir1cL1eM6TwONH2m6bIN3hp6s3D/xTHeRkWmdu', 'CUSTOMER'),
('Jane Customer', 'customer2@support.com', '$2a$10$rt7KGLp9T4mqZwJir1cL1eM6TwONH2m6bIN3hp6s3D/xTHeRkWmdu', 'CUSTOMER');
