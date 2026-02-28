-- Credential Requests Table
CREATE TABLE IF NOT EXISTS credential_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id TEXT UNIQUE NOT NULL,
  student_wallet TEXT NOT NULL,
  degree_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  document_ipfs_cid TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credentials Table
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_request_id UUID REFERENCES credential_requests(id) ON DELETE CASCADE,
  nft_asset_id BIGINT NOT NULL,
  metadata_ipfs_cid TEXT NOT NULL,
  metadata_hash TEXT NOT NULL,
  issued_tx_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credential_requests_student ON credential_requests(student_wallet);
CREATE INDEX idx_credential_requests_status ON credential_requests(status);
CREATE INDEX idx_credentials_asset_id ON credentials(nft_asset_id);
CREATE INDEX idx_credentials_request_id ON credentials(credential_request_id);
