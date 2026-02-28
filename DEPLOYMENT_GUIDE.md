# CredChain Deployment Guide

Complete guide to deploy the CredChain platform with Algorand smart contracts.

## Prerequisites

1. **Node.js & npm** (v18 or higher)
2. **Python 3.8+** (for Beaker smart contracts)
3. **Algorand Wallet** (Pera, Defly, or Exodus)
4. **TestNet ALGO** (from https://bank.testnet.algorand.network/)

## Step 1: Install Dependencies

### Frontend & Backend
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Smart Contract Dependencies
```bash
# Install Python dependencies
cd contracts
pip install -r requirements.txt
cd ..
```

## Step 2: Configure Environment Variables

### 2.1 Smart Contract Configuration

Edit `contracts/.env`:
```bash
ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGORAND_ALGOD_PORT=443
PLATFORM_ADMIN_WALLET=YOUR_WALLET_ADDRESS
PLATFORM_ADMIN_MNEMONIC="your twenty five word mnemonic phrase here"
```

**Important:** 
- Get your wallet address from Pera/Defly/Exodus wallet
- Export your mnemonic phrase (25 words) from your wallet
- Fund your wallet with TestNet ALGO: https://bank.testnet.algorand.network/

### 2.2 Backend Configuration

The `backend/.env` file is already configured with:
- Supabase credentials
- Algorand TestNet endpoints
- Pinata IPFS credentials

### 2.3 Frontend Configuration

The `.env` file is already configured with:
- Backend URL
- Algorand TestNet settings

## Step 3: Deploy Smart Contract

```bash
# Navigate to contracts directory
cd contracts

# Run deployment script
python deploy.py
```

The script will:
1. Connect to Algorand TestNet
2. Deploy the CredentialNFT contract
3. Set the platform administrator
4. Generate `DEPLOYMENT_INFO.md` with contract details

**Expected Output:**
```
🚀 Starting CredentialNFT deployment...
📍 Deployer address: YOUR_ADDRESS
💰 Account balance: X.XX ALGO
📝 Creating application...
✅ Application deployed successfully!
📋 App ID: 123456789
📬 App Address: CONTRACT_ADDRESS
🔗 Transaction ID: TXID
```

## Step 4: Update Environment Variables with Contract Info

After deployment, update the following files with the App ID and Address:

### Update `.env`:
```bash
VITE_APP_ID=123456789
VITE_APP_ADDRESS=CONTRACT_ADDRESS
```

### Update `backend/.env`:
```bash
ALGORAND_APP_ID=123456789
ALGORAND_APP_ADDRESS=CONTRACT_ADDRESS
```

## Step 5: Start the Application

### Terminal 1 - Backend Server
```bash
npm run backend
```

Backend will start on http://localhost:4000

### Terminal 2 - Frontend (Vite)
```bash
npm run dev
```

Frontend will start on http://localhost:3000

## Step 6: Verify Deployment

1. **Open Browser:** Navigate to http://localhost:3000
2. **Connect Wallet:** Click "Connect Wallet" and select your wallet
3. **Check Contract:** Visit AlgoExplorer to view your contract:
   ```
   https://testnet.algoexplorer.io/application/YOUR_APP_ID
   ```

## Testing the Platform

### As a Student:
1. Connect wallet
2. Navigate to "Student Dashboard"
3. Upload a credential document
4. Wait for college admin approval

### As College Admin:
1. Connect wallet (must be registered as college admin)
2. Navigate to "College Admin"
3. Review pending credentials
4. Approve/Reject credentials

### As Platform Admin:
1. Connect wallet (must be the platform admin address)
2. Navigate to "Platform Admin"
3. Register new colleges
4. Manage platform settings

### Verify Credentials:
1. Navigate to "Verify Credential"
2. Enter credential ID
3. View verification results

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
npm run build
npm start
```

### Smart Contract (MainNet)
1. Update `contracts/.env` with MainNet settings:
   ```bash
   ALGORAND_ALGOD_SERVER=https://mainnet-api.algonode.cloud
   ```
2. Fund MainNet wallet with real ALGO
3. Run deployment: `python deploy.py`

## Troubleshooting

### "Insufficient balance" error
- Fund your wallet with TestNet ALGO: https://bank.testnet.algorand.network/
- Minimum required: 0.1 ALGO

### "Connection failed" error
- Check if Algorand TestNet is accessible
- Verify your wallet is connected
- Try a different wallet provider

### "Module not found" error
- Run `npm install` in root directory
- Run `npm install` in backend directory
- Run `pip install -r requirements.txt` in contracts directory

### Contract deployment fails
- Verify your mnemonic phrase is correct (25 words)
- Check wallet has sufficient ALGO balance
- Ensure Python dependencies are installed

## Security Notes

⚠️ **Never commit `.env` files with real credentials to Git**
⚠️ **Keep your mnemonic phrase secure and private**
⚠️ **Use separate wallets for TestNet and MainNet**
⚠️ **Rotate API keys regularly in production**

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review contract code in `/contracts`
- Inspect backend API in `/backend/src`

## Next Steps

1. ✅ Deploy smart contract
2. ✅ Configure environment variables
3. ✅ Start backend and frontend
4. 🔄 Register colleges via Platform Admin
5. 🔄 Test credential issuance flow
6. 🔄 Verify credentials publicly
7. 🚀 Deploy to production

---

**Congratulations!** Your CredChain platform is now deployed and ready to use.
