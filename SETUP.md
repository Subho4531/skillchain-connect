# CredChain Complete Setup Guide

## Overview

CredChain is a production-ready DApp for issuing and verifying academic credentials as NFTs on Algorand Testnet. This guide will walk you through the complete setup process.

## Prerequisites

- Node.js 18+ and npm
- Git
- Algorand wallet (Pera, Defly, Lute, or Exodus)
- Testnet ALGO (get from https://bank.testnet.algorand.network/)
- Supabase account (free tier works)
- Pinata account (free tier works)

## Step 1: Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Setup Supabase Database

1. Create a new project at https://supabase.com
2. Go to SQL Editor
3. Run the migrations in order:

```sql
-- First run: supabase/migrations/001_initial_schema.sql
-- Then run: supabase/migrations/002_add_rejection_reason.sql
```

4. Get your credentials:
   - Project URL: Settings → API → Project URL
   - Service Role Key: Settings → API → service_role key (keep secret!)

## Step 3: Setup Pinata IPFS

1. Create account at https://pinata.cloud
2. Go to API Keys
3. Create new key with permissions:
   - pinFileToIPFS
   - pinJSONToIPFS
4. Save API Key and Secret Key

## Step 4: Setup Algorand Wallet

1. Install Pera Wallet (recommended) or any supported wallet
2. Create new wallet or import existing
3. Switch to Testnet
4. Get testnet ALGO from https://bank.testnet.algorand.network/
5. Copy your wallet address

## Step 5: Configure Backend

Create `backend/.env`:

```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
PLATFORM_ADMIN_WALLET=YOUR_ALGORAND_WALLET_ADDRESS
ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGORAND_ALGOD_PORT=443
ALGORAND_INDEXER_SERVER=https://testnet-idx.algonode.cloud
ALGORAND_INDEXER_PORT=443
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

**Important:** Replace all placeholder values with your actual credentials.

## Step 6: Configure Frontend

Create `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
```

## Step 7: Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see: `Server running on port 4000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see: `Ready on http://localhost:3000`

## Step 8: Test the Complete Flow

### 8.1 Platform Admin Setup

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select your wallet (Pera recommended)
4. Approve connection
5. Go to "Platform Admin" in navigation
6. Fill in institution form:
   - Name: "Test University"
   - Code: "TEST-UNI"
   - Admin Wallet: (use a different wallet address or same for testing)
7. Click "Create Institution"
8. Success! Institution created

### 8.2 Student Credential Request

1. Disconnect current wallet (if using same wallet for testing)
2. Connect with student wallet
3. Go to "Dashboard"
4. Click "Submit New Credential"
5. Fill form:
   - Credential ID: "CRED-2024-001" (must be unique)
   - Degree Name: "Bachelor of Computer Science"
   - Graduation Year: 2024
   - Institution: Select "Test University"
   - Document: Upload any PDF file
6. Click "Submit Request"
7. Wait for upload to IPFS (may take 10-30 seconds)
8. Success! Request submitted

### 8.3 College Admin Approval

1. Disconnect wallet
2. Connect with college admin wallet (the one you registered)
3. Go to "College Admin"
4. You should see the pending request
5. Click "View Document" to verify (opens IPFS gateway)
6. Click "Approve & Mint NFT"
7. Your wallet will popup asking to sign transaction
8. Approve the transaction
9. Wait for blockchain confirmation (~16 seconds)
10. Success! NFT minted and credential issued

### 8.4 Public Verification

1. Go to "Verify Credential" (no wallet needed)
2. Enter credential ID: "CRED-2024-001"
3. Click "Verify"
4. Wait for verification (queries blockchain and IPFS)
5. See verification result with all details
6. Click transaction hash to view on Algorand Explorer

## Troubleshooting

### Backend won't start
- Check all environment variables are set
- Verify Supabase connection
- Ensure port 4000 is not in use

### Frontend won't connect to backend
- Verify backend is running on port 4000
- Check NEXT_PUBLIC_BACKEND_URL is correct
- Check browser console for CORS errors

### Wallet won't connect
- Ensure you're on Testnet
- Try different wallet provider
- Clear browser cache
- Check wallet extension is installed

### Transaction fails
- Ensure wallet has testnet ALGO
- Check you're on correct network (Testnet)
- Verify wallet is unlocked
- Try again after a few seconds

### IPFS upload fails
- Verify Pinata API keys are correct
- Check file size (keep under 10MB)
- Ensure internet connection is stable

### Verification fails
- Wait a few seconds for indexer to update
- Check credential was actually approved
- Verify blockchain transaction succeeded
- Check IPFS gateway is accessible

## Production Deployment

### Backend (Railway/Render)

1. Push code to GitHub
2. Create new project on Railway/Render
3. Connect GitHub repository
4. Set environment variables (same as local .env)
5. Deploy
6. Note the production URL

### Frontend (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Set environment variable:
   - NEXT_PUBLIC_BACKEND_URL: your backend production URL
4. Deploy
5. Access your production URL

## Security Checklist

- [ ] Never commit .env files
- [ ] Keep SUPABASE_SERVICE_KEY secret
- [ ] Use different wallets for different roles in production
- [ ] Enable rate limiting in production
- [ ] Use HTTPS for production backend
- [ ] Regularly backup database
- [ ] Monitor IPFS pinning status
- [ ] Set up error logging (Sentry, etc.)

## Architecture Summary

```
User → Frontend (Next.js) → Backend (Express) → Algorand Blockchain
                                              → IPFS (Pinata)
                                              → Database (Supabase)
```

**Key Points:**
- Frontend handles UI and wallet signing
- Backend handles business logic and validation
- Blockchain is source of truth for ownership
- IPFS stores documents and metadata
- Database is index layer for fast queries

## Support

For issues:
1. Check this guide thoroughly
2. Review WORKFLOW.md for detailed flow
3. Check browser console for errors
4. Check backend logs for errors
5. Verify all environment variables

## Next Steps

After successful setup:
1. Test with multiple institutions
2. Test rejection flow
3. Test verification with invalid credentials
4. Monitor gas costs on testnet
5. Plan mainnet deployment strategy

Congratulations! Your CredChain DApp is now fully operational.
