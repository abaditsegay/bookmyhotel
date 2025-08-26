-- Fix Ethiopian hotel user passwords to use correct hash for 'password123'
-- Generated hash: $2b$12$Hw0cJgnPYDX/W2b5Fmy5YuY6BI3tb58BQCHQtXgtrWb4GuRxHPQP6

UPDATE users 
SET password = '$2b$12$Hw0cJgnPYDX/W2b5Fmy5YuY6BI3tb58BQCHQtXgtrWb4GuRxHPQP6' 
WHERE tenant_id = 'ethiopian-heritage';

-- Verify update
SELECT COUNT(*) as updated_users FROM users WHERE tenant_id = 'ethiopian-heritage';
