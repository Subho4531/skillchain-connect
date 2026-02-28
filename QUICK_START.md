# CredChain - Quick Start Guide

Get CredChain running in 10 minutes!

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] A web browser with wallet extension

## Step 1: Install Dependencies (2 minutes)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Get Required Accounts (5 minutes)

### 2.1 Supabase (Database)
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Wait for project to be ready
5. Go to Settings → API
6. Copy:
   - Project URL
   - service_role key (keep secret!)

### 2.2 Pinata (IPFS)
1. Go to https://pinata.cloud
2. Sign up (free)
3. Go to API Keys
4. Create new key
5. Copy:
   - API Key
   - API Secret

### 2.3 Algorand Wallet
1. Install Pera Wallet extension
2. Create new wallet
3. Switch to Testnet
4. Copy your wallet address
5. Get testnet ALGO: https://bank.testnet.algorand.network/

## Step 3: Setup Database (1 minute)

1. Go to your Supabase project
2. Click "SQL Editor"
3. Copy content from `supabase/migrations/001_initial_schema.sql`
4. Paste and run
5. Copy content from `supabase/migrations/002_add_rejection_reason.sql`
6. Paste and run
7. Done!

## Step 4: Configure Environment (1 minute)

### Backend Configuration

Create `backend/.env`:
```env
PORT=4000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
PLATFORM_ADMIN_WALLET=YOUR_WALLET_ADDRESS
ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGORAND_ALGOD_PORT=443
ALGORAND_INDEXER_SERVER=https://testnet-idx.algonode.cloud
ALGORAND_INDEXER_PORT=443
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

### Frontend Configuration

Create `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
```

## Step 5: Start Application (1 minute)

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Wait for: `Server running on port 4000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Wait for: `Ready on http://localhost:3000`

## Step 6: Test the Flow (5 minutes)

### Test 1: Create Institution
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select Pera Wallet
4. Approve connection
5. Click "Platform Admin"
6. Fill form:
   - Name: Test University
   - Code: TEST-UNI
   - Admin Wallet: (your wallet address)
7. Click "Create Institution"
8. ✅ Success!

### Test 2: Submit Credential
1. Click "Dashboard"
2. Click "Submit New Credential"
3. Fill form:
   - Credential ID: CRED-TEST-001
   - Degree: Bachelor of Computer Science
   - Year: 2024
   - Institution: Test University
   - Document: (any PDF file)
4. Click "Submit Request"
5. Wait for IPFS upload
6. ✅ Success!

### Test 3: Approve Credential
1. Click "College Admin"
2. See your pending request
3. Click "View Document" (opens IPFS)
4. Click "Approve & Mint NFT"
5. Wallet popup appears
6. Approve transaction
7. Wait ~16 seconds
8. ✅ NFT Minted!

### Test 4: Verify Credential
1. Click "Verify Credential"
2. Enter: CRED-TEST-001
3. Click "Verify"
4. Wait for verification
5. ✅ See verification result!

## Troubleshooting

### "Cannot connect to backend"
```bash
# Check backend is running
cd backend
npm run dev
```

### "Transaction failed"
- Ensure you have testnet ALGO
- Check you're on Testnet in wallet
- Try again after a few seconds

### "IPFS upload failed"
- Check Pinata API keys
- Ensure file is under 10MB
- Check internet connection

### "Wallet won't connect"
- Ensure wallet extension is installed
- Switch to Testnet in wallet
- Refresh page and try again

## What's Next?

Now that it's working:

1. **Read the docs:**
   - `WORKFLOW.md` - Understand the complete flow
   - `SETUP.md` - Detailed setup guide
   - `PROJECT_SUMMARY.md` - Technical overview

2. **Test more features:**
   - Try rejecting a credential
   - Test with multiple institutions
   - Verify invalid credentials

3. **Deploy to production:**
   - See `DEPLOYMENT.md`
   - Deploy backend to Railway/Render
   - Deploy frontend to Vercel

## Architecture at a Glance

```
┌─────────────┐
│   Browser   │
│  (Wallet)   │
└──────┬──────┘
       │
┌──────┴──────┐
│  Frontend   │  Next.js 14
│  (Port 3000)│
└──────┬──────┘
       │
┌──────┴──────┐
│   Backend   │  Express
│  (Port 4000)│
└──┬───┬───┬──┘
   │   │   │
   │   │   └─────────┐
   │   │             │
┌──┴───┴──┐    ┌─────┴─────┐
│Database │    │ Algorand  │
│Supabase │    │ Blockchain│
└─────────┘    └───────────┘
   │                 │
┌──┴──┐         ┌────┴────┐
│IPFS │         │ Indexer │
│Pinata│        └─────────┘
└─────┘
```

## Key Concepts

**NFT = Credential**
- Each approved credential becomes an NFT
- NFT is owned by the student
- NFT contains metadata hash
- Metadata stored on IPFS

**Verification = Blockchain Check**
- Query blockchain for NFT
- Check student owns it
- Fetch metadata from IPFS
- Verify all hashes match

**Database = Index**
- Fast lookups
- Not source of truth
- Blockchain is authoritative

## Support

Having issues? Check:
1. All environment variables are set
2. Backend is running on port 4000
3. Frontend is running on port 3000
4. Wallet is on Testnet
5. You have testnet ALGO

Still stuck? Review:
- `SETUP.md` for detailed setup
- `WORKFLOW.md` for how it works
- Browser console for errors
- Backend terminal for logs

## Success!

You now have a fully functional decentralized credential verification system running locally!

The system uses:
- ✅ Real Algorand blockchain
- ✅ Real IPFS storage
- ✅ Real cryptographic verification
- ✅ No mock data
- ✅ Production-ready code

Congratulations! 🎉
