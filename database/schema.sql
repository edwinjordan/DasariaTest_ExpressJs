-- ISP Management System Database Schema
-- Author: Oskar Pra Andrea Sussetyo

-- Create database
CREATE DATABASE IF NOT EXISTS isp_management;
USE isp_management;

-- 1. Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Permissions table
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Role-User pivot table (Many-to-Many)
CREATE TABLE role_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id)
);

-- 5. Permission-Role pivot table (Many-to-Many)
CREATE TABLE permission_role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    permission_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_permission_role (permission_id, role_id)
);

-- 6. Customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    id_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Service Packages table
CREATE TABLE service_packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    speed_mbps INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Subscriptions table
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    service_package_id INT NOT NULL,
    installation_address TEXT NOT NULL,
    installation_date DATE,
    status ENUM('pending', 'active', 'suspended', 'terminated') DEFAULT 'pending',
    monthly_fee DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_package_id) REFERENCES service_packages(id) ON DELETE RESTRICT
);

-- 9. Ticket Categories table
CREATE TABLE ticket_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    priority_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 10. Tickets table
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    subscription_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled') DEFAULT 'open',
    created_by INT,
    assigned_to INT,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. Ticket-User pivot table (Many-to-Many for multiple agents)
CREATE TABLE ticket_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ticket_user (ticket_id, user_id)
);

-- 12. Ticket Status History table
CREATE TABLE ticket_status_histories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    previous_status ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled'),
    new_status ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled') NOT NULL,
    comment TEXT,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default data
-- Insert default roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Full system access'),
('Agent NOC', 'Network Operations Center Agent'),
('Customer Service', 'Customer support representative');

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
('users.view', 'View users'),
('users.create', 'Create users'),
('users.update', 'Update users'),
('users.delete', 'Delete users'),
('customers.view', 'View customers'),
('customers.create', 'Create customers'),
('customers.update', 'Update customers'),
('customers.delete', 'Delete customers'),
('tickets.view', 'View tickets'),
('tickets.create', 'Create tickets'),
('tickets.update', 'Update tickets'),
('tickets.delete', 'Delete tickets'),
('subscriptions.view', 'View subscriptions'),
('subscriptions.create', 'Create subscriptions'),
('subscriptions.update', 'Update subscriptions'),
('subscriptions.delete', 'Delete subscriptions');

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO permission_role (permission_id, role_id)
SELECT p.id, r.id FROM permissions p, roles r WHERE r.name = 'Admin';

-- Agent NOC gets ticket management permissions
INSERT INTO permission_role (permission_id, role_id)
SELECT p.id, r.id FROM permissions p, roles r 
WHERE r.name = 'Agent NOC' AND p.name IN ('tickets.view', 'tickets.update', 'customers.view', 'subscriptions.view');

-- Customer Service gets customer and ticket management permissions
INSERT INTO permission_role (permission_id, role_id)
SELECT p.id, r.id FROM permissions p, roles r 
WHERE r.name = 'Customer Service' 
AND p.name IN ('customers.view', 'customers.create', 'customers.update', 'tickets.view', 'tickets.create', 'tickets.update', 'subscriptions.view');

-- Insert default ticket categories
INSERT INTO ticket_categories (name, description, priority_level) VALUES
('Connection Issue', 'Internet connection problems', 'high'),
('Speed Issue', 'Slow internet speed complaints', 'medium'),
('Hardware Problem', 'Router or modem issues', 'medium'),
('Billing Inquiry', 'Questions about billing', 'low'),
('Installation Request', 'New installation requests', 'medium'),
('Cancellation Request', 'Service cancellation requests', 'low');

-- Insert sample service packages
INSERT INTO service_packages (name, description, speed_mbps, price) VALUES
('Basic Package', 'Basic internet package for light usage', 10, 299000),
('Standard Package', 'Standard internet package for regular usage', 25, 499000),
('Premium Package', 'Premium internet package for heavy usage', 50, 799000),
('Business Package', 'High-speed internet for business use', 100, 1299000);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_ticket_status_histories_ticket_id ON ticket_status_histories(ticket_id);