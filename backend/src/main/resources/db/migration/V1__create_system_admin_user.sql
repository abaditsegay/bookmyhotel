-- Create database schema and system admin user

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    hotel_id BIGINT,
    PRIMARY KEY (id)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_role (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create hotels table (basic structure for foreign key)
CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_hotels_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

-- Add foreign key constraint for users.hotel_id
ALTER TABLE users ADD CONSTRAINT fk_users_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id);

-- Create system admin tenant
INSERT INTO tenants (id, name, subdomain, is_active, created_at) 
VALUES ('system', 'System Administration', 'admin', true, NOW())
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    subdomain = VALUES(subdomain),
    is_active = VALUES(is_active);

-- Create system admin user
-- Password: admin123 (BCrypt encoded)
INSERT INTO users (first_name, last_name, email, password, is_active, created_at, hotel_id)
VALUES ('System', 'Administrator', 'admin@bookmyhotel.com', '$2a$10$CwTycUXWue0Thq9StjUM0uBUxBL5XYnUyT2ow2uLqB2vhRkKoFEVa', true, NOW(), NULL)
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    password = VALUES(password),
    is_active = VALUES(is_active);

-- Assign SYSTEMADMIN role to the admin user
INSERT INTO user_roles (user_id, role)
SELECT id, 'SYSTEMADMIN'
FROM users
WHERE email = 'admin@bookmyhotel.com'
ON DUPLICATE KEY UPDATE role = VALUES(role);
