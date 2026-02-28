# CredChain System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CREDCHAIN SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Platform   │     │   College    │     │   Student    │
│    Admin     │     │    Admin     │     │   Wallet     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Frontend     │
                    │   (Next.js)    │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │   Backend      │
                    │   (Express)    │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│ Smart Contract │  │  IPFS/Pinata   │  │  Supabase   │
│   (Algorand)   │  │   (Storage)    │  │ (Database)  │
└────────────────┘  └────────────────┘  └─────────────┘
```

## Component Details

### 1. Frontend (Next.js 14)

**Purpose**: User interface for all roles

**Pages**:
- `/` - Landing page with wallet connect
- `/student` - Student portal (upload requests)
- `/admin/college` - College admin (approve/reject)
- `/admin/platform` - Platform admin (system status)

**Features**:
- Wallet integration (@txnlab/use-wallet)
- Role-based routing (auto-redirect)
- Real-time status updates
- Beautiful UI (Tailwind CSS)

**Flow**:
```
User connects wallet
    ↓
Frontend calls /api/auth/role
    ↓
Backend determines role
    ↓
Frontend redirects to appropriate page
```

### 2. Backend (Express + TypeScript)

**Purpose**: Business logic and blockchain integration

**Services**:

#### Contract Service
```typescript
getAdmins() → Read admin addresses from smart contract
verifyCollegeAdmin(wallet) → Verify wallet matches on-chain admin
```

#### IPFS Service
```typescript
uploadFile(buffer, filename) → Upload to IPFS, return CID + hash
uploadJSON(data) → Upload JSON to IPFS, return CID + hash
```

#### NFT Service
```typescript
mintCredentialNFT(params) → {
  1. Create metadata JSON
  2. Upload to IPFS
  3. Compute SHA256 hash
  4. Create ASA NFT
  5. Wait for confirmation
  6. Transfer to student
  7. Wait for confirmation
  8. Return asset ID + tx hash
}
```

**Middleware**:
```typescript
authenticateWallet() → Extract wallet from header
requireRole(role) → Verify user has required role
```

**Role Detection**:
```typescript
if (wallet === PLATFORM_ADMIN_WALLET) → PLATFORM_ADMIN
else if (wallet === COLLEGE_ADMIN_WALLET) → COLLEGE_ADMIN
else → STUDENT
```

### 3. Smart Contract (Beaker + PyTeal)

**Purpose**: On-chain admin registry

**Global State**:
- `platform_admin` (bytes) - Platform admin address
- `college_admin` (bytes) - College admin address

**Methods**:
```python
initialize(platform_admin, college_admin)
  → Set admin addresses (one-time)

update_college_admin(new_admin)
  → Update college admin (platform admin only)

get_platform_admin() → bytes
  → Read platform admin address

get_college_admin() → bytes
  → Read college admin address
```

**Security**:
- Immutable after initialization
- Only platform admin can update college admin
- Public read access for verification

### 4. Database (Supabase PostgreSQL)

**Purpose**: Fast queries and UI display (NOT source of truth)

**Tables**:

#### credential_requests
```sql
id                UUID PRIMARY KEY
credential_id     TEXT UNIQUE NOT NULL
student_wallet    TEXT NOT NULL
degree_name       TEXT NOT NULL
graduation_year   INTEGER NOT NULL
document_ipfs_cid TEXT NOT NULL
document_hash     TEXT NOT NULL
status            TEXT NOT NULL (PENDING | APPROVED | REJECTED)
rejection_reason  TEXT
created_at        TIMESTAMP
```

#### credentials
```sql
id                      UUID PRIMARY KEY
credential_request_id   UUID REFERENCES credential_requests(id)
nft_asset_id           BIGINT NOT NULL
metadata_ipfs_cid      TEXT NOT NULL
metadata_hash          TEXT NOT NULL
issued_tx_hash         TEXT NOT NULL
created_at             TIMESTAMP
```

### 5. IPFS (Pinata)

**Purpose**: Permanent decentralized storage

**Stored Data**:
1. **Documents** (PDF files)
   - Original credential documents
   - SHA256 hashed for integrity
   - Pinned permanently

2. **Metadata** (JSON)
   ```json
   {
     "credential_id": "CRED-2024-001",
     "student_wallet": "ADDRESS",
     "degree_name": "Bachelor of Science",
     "graduation_year": 2024,
     "document_ipfs_cid": "Qm...",
     "document_hash": "sha256...",
     "verified_by": "COLLEGE_ADMIN",
     "issued_at": "2024-01-01T00:00:00Z"
   }
   ```

## Data Flow

### Student Upload Flow

```
1. Student uploads PDF + metadata
   ↓
2. Frontend sends to /api/credentials/upload
   ↓
3. Backend:
   - Computes SHA256(PDF)
   - Uploads PDF to IPFS → CID
   - Inserts into credential_requests (status: PENDING)
   ↓
4. Returns success to frontend
```

### Approval & Minting Flow

```
1. College admin clicks "Approve"
   ↓
2. Frontend sends to /api/credentials/approve/:id
   ↓
3. Backend:
   a. Verify wallet === COLLEGE_ADMIN_WALLET
   b. Read college_admin from smart contract
   c. Verify wallet matches on-chain address
   d. Get credential request from DB
   ↓
4. Create metadata JSON
   ↓
5. Upload metadata to IPFS → CID
   ↓
6. Compute SHA256(metadata JSON)
   ↓
7. Create ASA NFT:
   - total: 1
   - decimals: 0
   - assetName: degree_name
   - unitName: "DEGREE"
   - assetURL: ipfs://CID
   - metadataHash: SHA256(metadata)
   ↓
8. Sign with college admin private key
   ↓
9. Send to Algorand network
   ↓
10. Wait for confirmation (algosdk.waitForConfirmation)
    ↓
11. Get Asset ID from confirmed transaction
    ↓
12. Transfer NFT to student wallet
    ↓
13. Wait for transfer confirmation
    ↓
14. ONLY AFTER BOTH CONFIRMATIONS:
    - Insert into credentials table
    - Update credential_requests status = APPROVED
    ↓
15. Return asset ID + tx hash to frontend
```

## Security Architecture

### Layer 1: Frontend
- Wallet connection only
- No role logic
- No blockchain calls
- Sends wallet address to backend

### Layer 2: Backend Middleware
```typescript
authenticateWallet() {
  wallet = req.headers['x-wallet-address']
  
  if (wallet === PLATFORM_ADMIN_WALLET)
    role = PLATFORM_ADMIN
  else if (wallet === COLLEGE_ADMIN_WALLET)
    role = COLLEGE_ADMIN
  else
    role = STUDENT
  
  req.wallet = wallet
  req.role = role
}
```

### Layer 3: Smart Contract Verification
```typescript
Before approval:
  1. Check req.role === COLLEGE_ADMIN
  2. Read college_admin from smart contract
  3. Verify req.wallet === on-chain college_admin
  4. Only then proceed with minting
```

### Layer 4: Transaction Confirmation
```typescript
After minting:
  1. Wait for blockchain confirmation
  2. Verify transaction succeeded
  3. Only then write to database
  4. No race conditions possible
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Smart Contract | Beaker, PyTeal | On-chain admin registry |
| Backend | Node.js, Express, TypeScript | Business logic |
| Frontend | Next.js 14, React, TypeScript | User interface |
| Database | Supabase (PostgreSQL) | Fast queries |
| Storage | IPFS (Pinata) | Permanent storage |
| Blockchain | Algorand TestNet | NFT minting |
| Wallet | @txnlab/use-wallet | Wallet connection |
| Hashing | crypto (SHA256) | Integrity verification |

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                      │
└─────────────────────────────────────────────────────────┘

Frontend (Vercel/Netlify)
    ↓ HTTPS
Backend (Railway/Render/Heroku)
    ↓
┌───────────────┬──────────────┬──────────────┐
│               │              │              │
Smart Contract  IPFS/Pinata   Supabase      Algorand
(Deployed)      (Cloud)       (Cloud)       (MainNet)
```

## Key Design Decisions

1. **Server-Side Role Detection**
   - Why: Never trust frontend
   - How: Compare wallet against env variables

2. **On-Chain Admin Verification**
   - Why: Prevent unauthorized minting
   - How: Read from smart contract before approval

3. **Transaction Confirmation**
   - Why: Ensure blockchain consistency
   - How: Wait for confirmation before DB write

4. **IPFS Storage**
   - Why: Permanent, decentralized
   - How: Pinata for reliable pinning

5. **SHA256 Hashing**
   - Why: Integrity verification
   - How: Hash documents and metadata

6. **Real ASA NFTs**
   - Why: Production-ready, no mocks
   - How: algosdk.makeAssetCreateTxn

---

**This architecture ensures security, consistency, and real blockchain integration.**
