-- Add system admin tenant and user

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
VALUES ('System', 'Administrator', 'admin@bookmyhotel.com', '$2a$10$l/hKxdW5eV.lhS4vRzoyl.U4F0TfkiUj.8KOIgqs2R8fwYfPQoHKK', true, NOW(), NULL)
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    password = VALUES(password),
    is_active = VALUES(is_active);

-- Assign SYSTEM_ADMIN role to the admin user
INSERT INTO user_roles (user_id, role)
SELECT id, 'SYSTEM_ADMIN'
FROM users
WHERE email = 'admin@bookmyhotel.com'
ON DUPLICATE KEY UPDATE role = VALUES(role);
