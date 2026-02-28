-- Add rejection_reason column to credential_requests if not exists
ALTER TABLE credential_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
