# CredChain Deployment Guide

## Prerequisites

1. Node.js 18+
2. Python 3.8+
3. Two Algorand wallets (Platform Admin & College Admin)
4. TestNet ALGO (https://bank.testnet.algorand.network/)

## Step 1: Install Dependencies

```bash
# Frontend & Backend
npm install
cd backend && npm install && cd ..

# Smart Contract
cd contracts
pip install beaker-pyteal pyteal py-algorand-sdk python-dotenv
cd ..
```

## Step 2: Configure Wallets

1. Create two Algorand wallets (Pera/Defly/Lute/Exodus)
2. Fund both with TestNet ALGO
3. Export mnemonic phrases from both wallets

Update `contracts/.env`:
```
PLATFORM_ADMIN_WALLET=YOUR_PLATFORM_ADMIN_ADDRESS
COLLEGE_ADMIN_WALLET=YOUR_COLLEGE_ADMIN_ADDRESS
DEPLOYER_MNEMONIC="your 25 word mnemonic for deployment"
```

Update `backend/.env`:
```
PLATFORM_ADMIN_WALLET=YOUR_PLATFORM_ADMIN_ADDRESS
COLLEGE_ADMIN_WALLET=YOUR_COLLEGE_ADMIN_ADDRESS
COLLEGE_ADMIN_MNEMONIC="college admin 25 word mnemonic"
```

## Step 3: Deploy Smart Contract

```bash
cd contracts
python deploy.py
```

This will output an App ID. Copy it.

## Step 4: Update Backend Config

In `backend/.env`, set:
```
ALGORAND_APP_ID=YOUR_APP_ID_HERE
```

## Step 5: Setup Database

1. Go to your Supabase project
2. Run the SQL from `supabase/migrations/001_credchain_schema.sql`

## Step 6: Start Services

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Step 7: Test the System

1. Open http://localhost:3000
2. Connect with Platform Admin wallet → redirects to /admin/platform
3. Connect with College Admin wallet → redirects to /admin/college
4. Connect with any other wallet → redirects to /student

## Workflow

1. **Student**: Upload credential request
2. **College Admin**: Review and approve (mints real NFT)
3. **Student**: See NFT asset ID and view on AlgoExplorer

## Important Notes

- NFT minting requires college admin wallet to have ALGO for fees
- Student wallet must opt-in to receive NFT (automatic in most wallets)
- All transactions are real on Algorand TestNet
- No mock data or simulations

## Production Deployment

For MainNet:
1. Change `ALGORAND_ALGOD_SERVER` to MainNet endpoint
2. Use real ALGO (not TestNet)
3. Deploy contract to MainNet
4. Update all environment variables
