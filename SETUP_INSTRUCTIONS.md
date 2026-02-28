# CredChain Setup Instructions

## ✅ Current Status

- ✅ Frontend running on http://localhost:3000
- ✅ Backend running on http://localhost:4000
- ⚠️ Smart contract NOT deployed yet
- ⚠️ Wallets need configuration

## 🚀 Next Steps

### Step 1: Configure Your Wallets

You need TWO Algorand wallets:

1. **Platform Admin Wallet** - For deploying contract
2. **College Admin Wallet** - For minting NFTs

#### Get Wallets:
- Download Pera Wallet, Defly, Lute, or Exodus
- Create two separate wallets
- Fund both with TestNet ALGO: https://bank.testnet.algorand.network/

#### Export Mnemonics:
- **Pera**: Settings → Security → Show Recovery Phrase
- **Defly**: Settings → Backup Wallet
- **Exodus**: Settings → Backup → View Secret Phrase

### Step 2: Update Configuration Files

#### Update `contracts/.env`:
```bash
PLATFORM_ADMIN_WALLET=YOUR_PLATFORM_ADMIN_ADDRESS_HERE
COLLEGE_ADMIN_WALLET=YOUR_COLLEGE_ADMIN_ADDRESS_HERE
DEPLOYER_MNEMONIC="your twenty five word mnemonic phrase here"
```

#### Update `backend/.env`:
```bash
PLATFORM_ADMIN_WALLET=YOUR_PLATFORM_ADMIN_ADDRESS_HERE
COLLEGE_ADMIN_WALLET=YOUR_COLLEGE_ADMIN_ADDRESS_HERE
COLLEGE_ADMIN_MNEMONIC="college admin twenty five word mnemonic here"
ALGORAND_APP_ID=0
```

### Step 3: Deploy Smart Contract

```bash
cd contracts
python deploy.py
```

**Expected Output:**
```
🚀 Deploying AdminRegistry Contract...
📍 Deployer: YOUR_ADDRESS
💰 Balance: X.XX ALGO
📝 Creating application...
✅ Contract deployed!
📋 App ID: 123456789
```

**Copy the App ID!**

### Step 4: Update Backend with App ID

Edit `backend/.env` and set:
```bash
ALGORAND_APP_ID=123456789
```

### Step 5: Setup Database

1. Go to your Supabase project: https://supabase.com/
2. Click "SQL Editor"
3. Copy and run the SQL from `supabase/migrations/001_credchain_schema.sql`

### Step 6: Restart Backend

Stop the backend (Ctrl+C in terminal) and restart:
```bash
cd backend
npm run dev
```

You should see:
```
✅ Server running on port 4000
📋 App ID: 123456789
👤 Platform Admin: YOUR_ADDRESS
🏛️  College Admin: YOUR_ADDRESS
```

### Step 7: Test the System

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Connect with your Platform Admin wallet
4. You should be redirected to `/admin/platform`
5. Verify contract admins are displayed

### Step 8: Test Full Workflow

#### As Student:
1. Disconnect wallet
2. Connect with a different wallet (not admin)
3. Go to `/student`
4. Upload a credential request:
   - Credential ID: `CRED-2024-001`
   - Degree: `Bachelor of Science`
   - Year: `2024`
   - Upload a PDF file
5. Click "Submit Request"

#### As College Admin:
1. Disconnect wallet
2. Connect with College Admin wallet
3. Go to `/admin/college`
4. You should see the pending request
5. Click "Approve & Mint NFT"
6. Wait for transaction confirmation (10-15 seconds)
7. You'll see the Asset ID

#### Verify NFT:
1. Go to https://testnet.algoexplorer.io/
2. Search for the Asset ID
3. Verify the NFT exists on-chain

## 🔧 Troubleshooting

### "Insufficient balance" error
- Fund your wallet at https://bank.testnet.algorand.network/
- Need at least 0.2 ALGO for deployment
- Need at least 0.1 ALGO for NFT minting

### "App ID not configured" error
- Make sure you deployed the contract
- Make sure you updated `backend/.env` with the App ID
- Restart the backend server

### "Wallet not authorized" error
- Make sure you're using the correct College Admin wallet
- Verify the wallet address matches what's in `backend/.env`
- Check the contract was initialized with correct addresses

### Database errors
- Make sure you ran the migration SQL in Supabase
- Check Supabase credentials in `backend/.env`
- Verify tables exist: `credential_requests`, `credentials`

## 📚 System Architecture

### Smart Contract (Beaker)
- Stores platform and college admin addresses on-chain
- Provides verification for admin permissions
- Deployed once, immutable admin registry

### Backend (Express)
- Verifies admin wallets against smart contract
- Handles file uploads to IPFS
- Mints real ASA NFTs on Algorand
- Waits for transaction confirmation before DB writes

### Frontend (Next.js)
- Role-based routing (auto-redirect based on wallet)
- Student portal for uploading requests
- College admin portal for approvals
- Platform admin portal for system status

### Database (Supabase)
- Stores credential requests and metadata
- NOT the source of truth (blockchain is)
- Used for fast queries and UI display

## 🎯 Key Features

✅ **Real Blockchain**: Every NFT is a real ASA on Algorand
✅ **On-Chain Verification**: Admin permissions verified via smart contract
✅ **IPFS Storage**: Documents stored permanently on IPFS
✅ **SHA256 Hashing**: Document and metadata integrity verification
✅ **Transaction Confirmation**: No DB writes until blockchain confirms
✅ **Duplicate Prevention**: Credential IDs are unique
✅ **Server-Side Security**: Role detection never trusts frontend

## 🚀 Production Deployment

See `DEPLOYMENT.md` for production deployment instructions.

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify all environment variables are set
3. Check server logs for errors
4. Ensure wallets have sufficient ALGO

---

**Ready to issue real blockchain credentials! 🎓**
