-- V59__Add_system_admin_users.sql
-- Add new system admin users with updated credentials

-- Add second system admin user (admin2@bookmyhotel.com, password: password123)
INSERT INTO users (first_name, last_name, email, password, phone, is_active, tenant_id)
VALUES ('Super', 'Admin', 'admin2@bookmyhotel.com', '$2a$10$FgOWKuQqtZIUFq6rKpxVF.LVK5yCBCGm8dQHrD6pCh6qR5TbP5p.u', '+1-555-0101', 1, NULL);

-- Get the admin user ID and assign ADMIN role
SET @admin2_user_id = LAST_INSERT_ID();
INSERT INTO user_roles (user_id, role) VALUES (@admin2_user_id, 'ADMIN');

-- Update the existing admin user password to 'password' (keeping the original email)
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@bookmyhotel.com';
