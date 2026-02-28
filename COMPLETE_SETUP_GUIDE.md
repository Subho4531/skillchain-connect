# 📘 Complete CredChain Setup Guide

This is the ultimate guide to get CredChain running from scratch.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | https://nodejs.org/ |
| Python | 3.8+ | https://python.org/ |
| Git | Latest | https://git-scm.com/ |

### Required Accounts

| Service | Purpose | Sign Up |
|---------|---------|---------|
| Algorand Wallet | Blockchain transactions | Pera/Defly/Exodus app |
| Supabase | Database | https://supabase.com/ |
| Pinata | IPFS storage | https://pinata.cloud/ |

### Required Funds

- TestNet ALGO (free): https://bank.testnet.algorand.network/
- Minimum: 0.1 ALGO for contract deployment

---

## Installation

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd credchain
```

### Step 2: Install Dependencies

#### Option A: Automated Setup (Recommended)

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows PowerShell:**
```powershell
.\setup.ps1
```

#### Option B: Manual Setup

```bash
# Install Node.js dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install Python dependencies
cd contracts
pip install -r requirements.txt
cd ..
```

### Step 3: Verify Installation

```bash
# Check Node.js
node --version  # Should be 18+

# Check Python
python --version  # Should be 3.8+

# Check npm packages
npm list --depth=0

# Check Python packages
cd contracts
pip list | grep -E "beaker|pyteal|algorand"
cd ..
```

---

## Smart Contract Deployment

### Step 1: Get TestNet ALGO

1. Install Algorand wallet:
   - **Pera Wallet**: https://perawallet.app/
   - **Defly Wallet**: https://defly.app/
   - **Exodus Wallet**: https://exodus.com/

2. Create/Import wallet in the app

3. Copy your wallet address (starts with uppercase letters)

4. Visit TestNet dispenser: https://bank.testnet.algorand.network/

5. Paste your address and click "Dispense"

6. Wait for confirmation (usually instant)

7. Verify balance in your wallet app

### Step 2: Export Mnemonic Phrase

**Pera Wallet:**
1. Open Pera Wallet
2. Go to Settings → Security
3. Tap "Show Recovery Phrase"
4. Enter your PIN/password
5. Copy all 25 words in order

**Defly Wallet:**
1. Open Defly Wallet
2. Go to Settings
3. Tap "Backup Wallet"
4. Copy all 25 words in order

**Exodus Wallet:**
1. Open Exodus Wallet
2. Go to Settings → Backup
3. Click "View Secret Phrase"
4. Copy all 25 words in order

### Step 3: Configure Contract

Create `contracts/.env`:

```bash
# Algorand Configuration
ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGORAND_ALGOD_PORT=443
ALGORAND_ALGOD_TOKEN=

# Your Wallet Details
PLATFORM_ADMIN_WALLET=YOUR_WALLET_ADDRESS_HERE
PLATFORM_ADMIN_MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25"
```

**Important:**
- Replace `YOUR_WALLET_ADDRESS_HERE` with your actual address
- Replace the mnemonic with your actual 25 words
- Keep quotes around the mnemonic
- Don't share this file with anyone

### Step 4: Deploy Contract

```bash
npm run deploy:contract
```

**Expected Output:**
```
🚀 Starting CredentialNFT deployment...
📍 Deployer address: YOUR_ADDRESS
💰 Account balance: 10.0 ALGO
📝 Creating application...
✅ Application deployed successfully!
📋 App ID: 123456789
📬 App Address: ABC123XYZ...
🔗 Transaction ID: TXID123...
✅ Platform admin set successfully!

📄 Deployment info saved to DEPLOYMENT_INFO.md
🌐 View on AlgoExplorer: https://testnet.algoexplorer.io/application/123456789
```

### Step 5: Save Deployment Info

The script creates `contracts/DEPLOYMENT_INFO.md` with:
- App ID
- App Address
- Transaction ID
- AlgoExplorer link

**Save these values - you'll need them next!**

---

## Environment Configuration

### Frontend Configuration

Create `.env` in the root directory:

```bash
# Backend API
VITE_BACKEND_URL=http://localhost:4000

# Algorand Network
VITE_ALGORAND_NETWORK=testnet
VITE_ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGORAND_ALGOD_PORT=443

# Smart Contract (from deployment)
VITE_APP_ID=123456789
VITE_APP_ADDRESS=ABC123XYZ...
```

### Backend Configuration

Create `backend/.env`:

```bash
# Server
PORT=4000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# Algorand
PLATFORM_ADMIN_WALLET=YOUR_WALLET_ADDRESS
ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGORAND_ALGOD_PORT=443
ALGORAND_INDEXER_SERVER=https://testnet-idx.algonode.cloud
ALGORAND_INDEXER_PORT=443

# Smart Contract (from deployment)
ALGORAND_APP_ID=123456789
ALGORAND_APP_ADDRESS=ABC123XYZ...

# IPFS/Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### Getting Supabase Credentials

1. Go to https://supabase.com/
2. Sign up/Login
3. Create new project
4. Wait for project to initialize
5. Go to Settings → API
6. Copy:
   - Project URL → `SUPABASE_URL`
   - Service Role Key → `SUPABASE_SERVICE_KEY`

### Getting Pinata Credentials

1. Go to https://pinata.cloud/
2. Sign up/Login
3. Go to API Keys
4. Click "New Key"
5. Enable "pinFileToIPFS" permission
6. Create key
7. Copy:
   - API Key → `PINATA_API_KEY`
   - API Secret → `PINATA_SECRET_KEY`

---

## Database Setup

### Step 1: Access Supabase SQL Editor

1. Open your Supabase project
2. Click "SQL Editor" in sidebar
3. Click "New Query"

### Step 2: Run Migrations

**Migration 1: Initial Schema**

Copy contents of `supabase/migrations/001_initial_schema.sql` and run it.

This creates:
- `colleges` table
- `credentials` table
- `nft_metadata` table
- Indexes and constraints

**Migration 2: Add Rejection Reason**

Copy contents of `supabase/migrations/002_add_rejection_reason.sql` and run it.

This adds:
- `rejection_reason` column to credentials

### Step 3: Verify Tables

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- colleges
- credentials
- nft_metadata

---

## Running the Application

### Terminal 1: Start Backend

```bash
npm run backend
```

**Expected Output:**
```
Server running on port 4000
Connected to Supabase
Algorand client initialized
```

**If you see errors:**
- Check `backend/.env` file exists
- Verify all environment variables are set
- Check Supabase credentials are correct

### Terminal 2: Start Frontend

```bash
npm run dev
```

**Expected Output:**
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h to show help
```

**If you see errors:**
- Check `.env` file exists
- Verify all environment variables are set
- Check port 3000 is not in use

### Step 3: Open Browser

Navigate to: http://localhost:3000

You should see the CredChain homepage with:
- Navigation bar
- "Connect Wallet" button
- Feature cards
- "How It Works" section

---

## Testing

### Test 1: Wallet Connection

1. Click "Connect Wallet"
2. Select your wallet (Pera/Defly/Exodus)
3. Approve connection in wallet app
4. Verify wallet address appears in navbar

### Test 2: Platform Admin

1. Connect with platform admin wallet
2. Click "Platform Admin" in navbar
3. Register a test college:
   - Name: "Test University"
   - Admin Wallet: (another wallet address)
4. Verify college appears in list

### Test 3: Student Flow

1. Disconnect current wallet
2. Connect with student wallet
3. Click "Student Dashboard"
4. Upload a test credential:
   - Select college
   - Upload PDF file
   - Fill in details
5. Verify credential appears as "Pending"

### Test 4: College Admin

1. Disconnect current wallet
2. Connect with college admin wallet
3. Click "College Admin"
4. Verify pending credential appears
5. Click "Approve"
6. Sign transaction in wallet
7. Wait for NFT minting
8. Verify credential status changes to "Approved"

### Test 5: Verification

1. Copy credential ID from student dashboard
2. Go to "Verify Credential"
3. Paste credential ID
4. Click "Verify"
5. Verify details are correct
6. Check blockchain verification status

### Test 6: Blockchain Verification

1. Go to https://testnet.algoexplorer.io/
2. Search for your App ID
3. Verify contract exists
4. Check transactions
5. Verify NFT was minted

---

## Troubleshooting

### "Insufficient balance" Error

**Problem:** Not enough ALGO in wallet

**Solution:**
1. Visit https://bank.testnet.algorand.network/
2. Enter your wallet address
3. Click "Dispense"
4. Wait for confirmation
5. Try again

### "Connection failed" Error

**Problem:** Wallet not connecting

**Solution:**
1. Refresh the page
2. Try a different wallet provider
3. Check wallet app is open
4. Verify you're on TestNet in wallet settings

### "Module not found" Error

**Problem:** Dependencies not installed

**Solution:**
```bash
# Reinstall all dependencies
npm run setup
cd contracts
pip install -r requirements.txt
cd ..
```

### Contract Deployment Fails

**Problem:** Deployment script errors

**Solution:**
1. Verify mnemonic is correct (25 words)
2. Check wallet has ALGO balance
3. Verify Python dependencies installed:
   ```bash
   cd contracts
   pip list | grep -E "beaker|pyteal|algorand"
   ```
4. Try deployment again

### Backend Won't Start

**Problem:** Backend server errors

**Solution:**
1. Check `backend/.env` exists
2. Verify all variables are set
3. Check Supabase credentials
4. Verify port 4000 is available:
   ```bash
   # Linux/Mac
   lsof -i :4000
   
   # Windows
   netstat -ano | findstr :4000
   ```

### Frontend Won't Start

**Problem:** Vite server errors

**Solution:**
1. Check `.env` exists in root
2. Verify all variables are set
3. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Database Errors

**Problem:** Supabase connection issues

**Solution:**
1. Verify Supabase project is active
2. Check credentials in `backend/.env`
3. Verify migrations ran successfully
4. Check tables exist in Supabase dashboard

### NFT Minting Fails

**Problem:** Approval doesn't mint NFT

**Solution:**
1. Check backend logs for errors
2. Verify Pinata credentials
3. Check wallet has ALGO for transaction
4. Verify App ID is correct in `.env`

---

## Next Steps

After successful setup:

1. ✅ Register multiple colleges
2. ✅ Test complete credential flow
3. ✅ Verify credentials publicly
4. ✅ Check blockchain transactions
5. 🚀 Deploy to production (see DEPLOYMENT_GUIDE.md)

---

## Support Resources

- **Quick Start**: See `QUICK_DEPLOY.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Contract Docs**: See `contracts/README.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

---

## Security Reminders

⚠️ **Never commit `.env` files to Git**
⚠️ **Keep mnemonic phrases secure and private**
⚠️ **Use separate wallets for TestNet and MainNet**
⚠️ **Rotate API keys regularly in production**

---

**Congratulations! Your CredChain platform is now fully operational! 🎉**
