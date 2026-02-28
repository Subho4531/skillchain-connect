# 🏗️ CredChain Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CredChain Platform                       │
│                  Blockchain Credential Verification              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │◄────►│   Backend    │◄────►│  Blockchain  │
│  (Vite/React)│      │  (Express)   │      │  (Algorand)  │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                      │
       │                     │                      │
       ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Wallets    │      │   Database   │      │     IPFS     │
│ Pera/Defly   │      │  (Supabase)  │      │  (Pinata)    │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Component Architecture

### 1. Frontend Layer (Vite + React)

```
src/
├── app/                    # Application Pages
│   ├── page.tsx           # Homepage
│   ├── admin/
│   │   ├── college/       # College Admin Portal
│   │   └── platform/      # Platform Admin Portal
│   ├── student/
│   │   └── dashboard/     # Student Dashboard
│   └── verify/            # Public Verification
│
├── components/            # React Components
│   ├── Providers.tsx     # Context Providers
│   ├── WalletConnect.tsx # Wallet Integration
│   └── ui/               # UI Components
│
└── lib/                  # Utilities
    ├── api.ts           # API Client
    └── utils.ts         # Helper Functions
```

**Technologies:**
- Vite (Build Tool)
- React 18 (UI Framework)
- TypeScript (Type Safety)
- Tailwind CSS (Styling)
- Radix UI (Components)
- TanStack Query (State Management)
- @txnlab/use-wallet (Wallet Integration)

**Key Features:**
- Lightning-fast HMR
- Optimized builds
- Modern UI/UX
- Responsive design
- Wallet integration

### 2. Backend Layer (Node.js + Express)

```
backend/src/
├── config/               # Configuration
│   ├── algorand.ts      # Algorand Client
│   ├── database.ts      # Supabase Client
│   └── ipfs.ts          # IPFS Client
│
├── middleware/          # Express Middleware
│   └── auth.ts         # Authentication
│
├── routes/             # API Routes
│   ├── credentials.ts  # Credential Endpoints
│   ├── colleges.ts     # College Endpoints
│   └── verify.ts       # Verification Endpoints
│
├── services/           # Business Logic
│   ├── nft.ts         # NFT Minting
│   └── verification.ts # Verification Logic
│
└── utils/             # Utilities
    └── crypto.ts      # Cryptographic Functions
```

**Technologies:**
- Node.js (Runtime)
- Express (Web Framework)
- TypeScript (Type Safety)
- Algorand SDK (Blockchain)
- Supabase Client (Database)
- Axios (HTTP Client)

**Key Features:**
- RESTful API
- Wallet authentication
- NFT minting
- IPFS integration
- Database operations

### 3. Smart Contract Layer (Algorand + Beaker)

```
contracts/
├── credential_nft.py    # Main Contract
├── deploy.py           # Deployment Script
├── requirements.txt    # Python Dependencies
└── README.md          # Documentation
```

**Contract Structure:**

```python
class CredentialNFT(Application):
    # Global State
    - platform_admin: Address
    - total_credentials: uint64
    
    # Local State
    - credential_count: uint64
    
    # Methods
    - set_admin()
    - issue_credential()
    - verify_credential()
    - revoke_credential()
    - get_credential_count()
    - get_total_credentials()
```

**Technologies:**
- Python 3.8+
- PyTeal (Smart Contract Language)
- Beaker (Framework)
- Algorand SDK

**Key Features:**
- Credential issuance
- Verification logic
- Revocation capability
- Admin management
- Counter tracking

### 4. Database Layer (Supabase)

```sql
Tables:
├── colleges
│   ├── id (uuid)
│   ├── name (text)
│   ├── admin_wallet (text)
│   ├── created_at (timestamp)
│   └── is_active (boolean)
│
├── credentials
│   ├── id (uuid)
│   ├── student_wallet (text)
│   ├── college_id (uuid)
│   ├── document_hash (text)
│   ├── status (text)
│   ├── nft_asset_id (bigint)
│   ├── created_at (timestamp)
│   └── rejection_reason (text)
│
└── nft_metadata
    ├── id (uuid)
    ├── credential_id (uuid)
    ├── ipfs_hash (text)
    ├── metadata_hash (text)
    ├── created_at (timestamp)
    └── transaction_id (text)
```

**Purpose:**
- Index layer for fast queries
- NOT the source of truth
- Caching blockchain data
- User management

### 5. Storage Layer (IPFS/Pinata)

```
IPFS Storage:
├── Credential Documents (PDF/Images)
├── NFT Metadata (JSON)
└── Verification Data
```

**Data Flow:**
1. Document uploaded → Pinata
2. Returns IPFS hash
3. Hash stored in database
4. Hash included in NFT metadata
5. Public retrieval via IPFS gateway

## Data Flow Diagrams

### Credential Issuance Flow

```
┌─────────┐
│ Student │
└────┬────┘
     │ 1. Upload Document
     ▼
┌─────────────┐
│  Frontend   │
└─────┬───────┘
      │ 2. Send to Backend
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 3. Upload to IPFS
      ▼
┌─────────────┐
│    IPFS     │
└─────┬───────┘
      │ 4. Return Hash
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 5. Store in DB
      ▼
┌─────────────┐
│  Database   │
└─────────────┘
```

### Credential Approval Flow

```
┌──────────────┐
│ College Admin│
└──────┬───────┘
       │ 1. Approve Request
       ▼
┌─────────────┐
│  Frontend   │
└─────┬───────┘
      │ 2. Send Approval
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 3. Create Metadata
      ▼
┌─────────────┐
│    IPFS     │
└─────┬───────┘
      │ 4. Return Hash
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 5. Call Smart Contract
      ▼
┌─────────────┐
│  Algorand   │
└─────┬───────┘
      │ 6. Mint NFT
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 7. Update Database
      ▼
┌─────────────┐
│  Database   │
└─────┬───────┘
      │ 8. Notify Student
      ▼
┌─────────────┐
│  Frontend   │
└─────────────┘
```

### Verification Flow

```
┌─────────┐
│ Verifier│
└────┬────┘
     │ 1. Enter Credential ID
     ▼
┌─────────────┐
│  Frontend   │
└─────┬───────┘
      │ 2. Request Verification
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 3. Query Database
      ▼
┌─────────────┐
│  Database   │
└─────┬───────┘
      │ 4. Get NFT Asset ID
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 5. Check Blockchain
      ▼
┌─────────────┐
│  Algorand   │
└─────┬───────┘
      │ 6. Verify Ownership
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 7. Fetch Metadata
      ▼
┌─────────────┐
│    IPFS     │
└─────┬───────┘
      │ 8. Return Metadata
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 9. Verify Hashes
      │ 10. Return Result
      ▼
┌─────────────┐
│  Frontend   │
└─────────────┘
```

## Security Architecture

### Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Connect Wallet
     ▼
┌─────────────┐
│   Wallet    │
└─────┬───────┘
      │ 2. Sign Message
      ▼
┌─────────────┐
│  Frontend   │
└─────┬───────┘
      │ 3. Send Signature
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 4. Verify Signature
      │ 5. Check Role
      ▼
┌─────────────┐
│  Database   │
└─────┬───────┘
      │ 6. Return User Data
      ▼
┌─────────────┐
│   Backend   │
└─────┬───────┘
      │ 7. Grant Access
      ▼
┌─────────────┐
│  Frontend   │
└─────────────┘
```

### Security Layers

1. **Wallet Authentication**
   - Cryptographic signatures
   - No passwords needed
   - Wallet-based identity

2. **Role-Based Access Control**
   - Platform Admin
   - College Admin
   - Student
   - Public Verifier

3. **Blockchain Security**
   - Immutable records
   - Cryptographic hashing
   - Decentralized verification

4. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - Environment variables

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────┐
│         Local Development           │
├─────────────────────────────────────┤
│ Frontend: http://localhost:3000     │
│ Backend:  http://localhost:4000     │
│ Network:  Algorand TestNet          │
│ Database: Supabase Cloud            │
│ Storage:  Pinata IPFS               │
└─────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────┐
│         Production Deployment        │
├─────────────────────────────────────┤
│ Frontend: Vercel/Netlify            │
│ Backend:  Railway/Render/Heroku     │
│ Network:  Algorand MainNet          │
│ Database: Supabase Cloud            │
│ Storage:  Pinata IPFS               │
└─────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vite + React | Fast, modern UI |
| Styling | Tailwind CSS | Responsive design |
| Components | Radix UI | Accessible components |
| State | TanStack Query | Data fetching |
| Wallet | @txnlab/use-wallet | Multi-wallet support |
| Backend | Node.js + Express | API server |
| Smart Contract | PyTeal + Beaker | Blockchain logic |
| Blockchain | Algorand | NFT platform |
| Database | Supabase | PostgreSQL |
| Storage | IPFS/Pinata | Decentralized storage |
| Language | TypeScript | Type safety |

## Performance Characteristics

### Frontend
- Initial Load: < 2s
- HMR Update: < 100ms
- Build Time: < 30s
- Bundle Size: < 500KB

### Backend
- API Response: < 200ms
- NFT Minting: 3-5s
- IPFS Upload: 1-3s
- Database Query: < 50ms

### Blockchain
- Transaction Confirmation: 3-5s
- Block Time: ~3.7s
- Finality: Instant
- Cost: ~0.001 ALGO per transaction

## Scalability

### Horizontal Scaling
- Frontend: CDN distribution
- Backend: Load balancer + multiple instances
- Database: Supabase auto-scaling
- IPFS: Pinata managed pinning

### Vertical Scaling
- Backend: Increase server resources
- Database: Upgrade Supabase plan
- IPFS: Increase Pinata storage

## Monitoring & Observability

### Metrics to Track
- API response times
- Transaction success rate
- NFT minting time
- IPFS upload time
- Database query performance
- Error rates
- User activity

### Logging
- Backend: Winston/Pino
- Frontend: Console + Error tracking
- Blockchain: Transaction logs
- Database: Supabase logs

---

**This architecture provides a secure, scalable, and performant platform for blockchain-based credential verification.**
