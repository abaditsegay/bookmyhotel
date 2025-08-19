-- Phase 1: Make User entity support both tenant-bound and system-wide users
-- Allow tenant_id to be nullable for GUEST and ADMIN users

-- Step 1: Make tenant_id nullable in users table
ALTER TABLE users MODIFY COLUMN tenant_id VARCHAR(50) NULL;

-- Step 2: Add index for better performance on queries by tenant_id
-- Note: MySQL doesn't support conditional indices like PostgreSQL, so we'll create a regular index
CREATE INDEX idx_user_tenant_nullable ON users (tenant_id);

-- Step 3: Update unique constraint on email to be global (already exists)
-- Email uniqueness is already enforced globally, which is correct for system-wide users

-- Step 4: Add a comment for future reference
-- Constraint for system-wide roles having NULL tenant_id is enforced at the application level
