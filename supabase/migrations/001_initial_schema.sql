-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('PLATFORM_ADMIN', 'COLLEGE_ADMIN', 'STUDENT')),
  institution_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutions table
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  admin_wallet TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credential requests table
CREATE TABLE credential_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id TEXT UNIQUE NOT NULL,
  student_wallet TEXT NOT NULL,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  degree_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  document_ipfs_cid TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credentials table
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_request_id UUID NOT NULL REFERENCES credential_requests(id),
  nft_asset_id BIGINT NOT NULL UNIQUE,
  metadata_ipfs_cid TEXT NOT NULL,
  metadata_hash TEXT NOT NULL,
  issued_tx_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verifications table
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id TEXT NOT NULL,
  result TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- Indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_credential_requests_student ON credential_requests(student_wallet);
CREATE INDEX idx_credential_requests_institution ON credential_requests(institution_id);
CREATE INDEX idx_credential_requests_status ON credential_requests(status);
CREATE INDEX idx_credentials_asset_id ON credentials(nft_asset_id);
CREATE INDEX idx_verifications_credential ON verifications(credential_id);

-- Foreign key for users
ALTER TABLE users ADD CONSTRAINT fk_users_institution 
  FOREIGN KEY (institution_id) REFERENCES institutions(id);
