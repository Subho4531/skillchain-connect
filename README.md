# CredChain - Decentralized Academic Credential Issuer

Production-ready MVP for issuing real NFT credentials on Algorand blockchain.

## Features

✅ **Real Blockchain Integration**
- Real ASA NFT minting on Algorand TestNet
- Transaction confirmation before database writes
- On-chain admin verification via smart contract

✅ **IPFS Storage**
- Documents uploaded to IPFS via Pinata
- SHA256 hashing for integrity verification
- Permanent decentralized storage

✅ **Role-Based Access**
- Platform Admin: Deploy contract, view system status
- College Admin: Approve/reject requests, mint NFTs
- Student: Upload requests, view issued NFTs

✅ **Security**
- Server-side role detection
- On-chain admin verification
- No client-side trust
- Duplicate prevention

## Tech Stack

**Frontend**: Next.js 14, TypeScript, Tailwind CSS, TanStack Query, @txnlab/use-wallet
**Backend**: Node.js, Express, TypeScript, algosdk
**Blockchain**: Algorand TestNet, Beaker smart contracts
**Storage**: IPFS (Pinata), Supabase PostgreSQL

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
cd contracts && pip install -r requirements.txt && cd ..
```

### 2. Configure Wallets

Create two Algorand wallets and fund with TestNet ALGO:
https://bank.testnet.algorand.network/

Update `contracts/.env` and `backend/.env` with your wallet addresses and mnemonics.

### 3. Deploy Smart Contract

```bash
cd contracts
python deploy.py
```

Copy the App ID and update `backend/.env`:
```
ALGORAND_APP_ID=YOUR_APP_ID
```

### 4. Setup Database

Run `supabase/migrations/001_credchain_schema.sql` in your Supabase project.

### 5. Start Services

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

Visit http://localhost:3000

## System Workflow

1. **Student** uploads credential request (PDF + metadata)
   - Document hashed (SHA256) and uploaded to IPFS
   - Request stored with status PENDING

2. **College Admin** reviews request
   - Backend verifies admin wallet against smart contract
   - Admin approves or rejects

3. **NFT Minting** (on approval)
   - Metadata JSON created and uploaded to IPFS
   - Metadata hashed (SHA256)
   - Real ASA NFT created with metadata hash
   - Transaction confirmed on-chain
   - NFT transferred to student wallet
   - Only after confirmation: database updated

4. **Student** receives NFT
   - Asset ID visible in dashboard
   - Viewable on AlgoExplorer
   - Permanent proof of credential

## Project Structure

```
credchain/
├── contracts/              # Beaker smart contracts
│   ├── admin_registry.py  # On-chain admin registry
│   └── deploy.py          # Deployment script
├── backend/               # Express backend
│   └── src/
│       ├── config/        # Configuration
│       ├── middleware/    # Auth middleware
│       ├── routes/        # API routes
│       └── services/      # Business logic
├── src/                   # Next.js frontend
│   ├── app/              # Pages
│   │   ├── admin/        # Admin dashboards
│   │   └── student/      # Student portal
│   ├── components/       # React components
│   └── lib/              # API client
└── supabase/             # Database migrations
```

## API Endpoints

- `GET /api/auth/role` - Get user role
- `POST /api/credentials/upload` - Upload credential request
- `GET /api/credentials/my-requests` - Get student requests
- `GET /api/credentials/pending` - Get pending requests (admin)
- `POST /api/credentials/approve/:id` - Approve and mint NFT
- `POST /api/credentials/reject/:id` - Reject request
- `GET /api/admin/contract-admins` - Get on-chain admin addresses

## Security Features

- Server-side role detection (never trust frontend)
- On-chain admin verification before approval
- Transaction confirmation before database writes
- Duplicate credential ID prevention
- SHA256 hashing for document integrity
- IPFS content addressing

## Environment Variables

See `.env.local`, `backend/.env`, and `contracts/.env` for required configuration.

## Production Deployment

1. Deploy smart contract to MainNet
2. Update all environment variables
3. Deploy backend to Railway/Render/Heroku
4. Deploy frontend to Vercel/Netlify
5. Ensure college admin wallet has sufficient ALGO for fees

## License

MIT

## Support

For issues or questions, see DEPLOYMENT.md for detailed instructions.
