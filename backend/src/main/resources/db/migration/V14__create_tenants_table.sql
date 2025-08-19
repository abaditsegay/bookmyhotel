-- Create tenants table for managing tenant information
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(50) UNIQUE,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tenant_id ON tenants(tenant_id);
CREATE INDEX idx_tenant_name ON tenants(name);
CREATE INDEX idx_tenant_status ON tenants(is_active);

-- Insert existing tenant data (migrating from the old schema)
INSERT INTO tenants (tenant_id, name, subdomain, is_active, created_at, updated_at) VALUES
(UUID(), 'Default Hotel Chain', 'demo', TRUE, '2025-08-17 07:23:58', '2025-08-17 07:23:58'),
(UUID(), 'Hilton Hotels', 'hilton', TRUE, '2025-08-17 07:23:58', '2025-08-17 07:23:58'),
(UUID(), 'Marriott Hotels', 'marriott', TRUE, '2025-08-17 07:23:58', '2025-08-17 07:23:58');

-- Insert default tenant for development
INSERT INTO tenants (tenant_id, name, description) 
VALUES (UUID(), 'development', 'Default development tenant');
