# 🚀 Quick Deploy Guide

Get CredChain up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed
- [ ] Algorand wallet (Pera/Defly/Exodus)
- [ ] TestNet ALGO in wallet

## 1️⃣ Install Everything

```bash
# Install all dependencies at once
npm run setup

# Install Python dependencies for smart contracts
cd contracts
pip install -r requirements.txt
cd ..
```

## 2️⃣ Get TestNet ALGO

1. Open your Algorand wallet (Pera, Defly, or Exodus)
2. Copy your wallet address
3. Visit: https://bank.testnet.algorand.network/
4. Paste your address and get free TestNet ALGO

## 3️⃣ Configure Smart Contract

Edit `contracts/.env`:

```bash
PLATFORM_ADMIN_WALLET=YOUR_WALLET_ADDRESS_HERE
PLATFORM_ADMIN_MNEMONIC="your twenty five word mnemonic phrase here"
```

**How to get your mnemonic:**
- **Pera Wallet:** Settings → Security → Show Recovery Phrase
- **Defly Wallet:** Settings → Backup Wallet
- **Exodus Wallet:** Settings → Backup → View Secret Phrase

## 4️⃣ Deploy Smart Contract

```bash
npm run deploy:contract
```

This will output something like:
```
✅ Application deployed successfully!
📋 App ID: 123456789
📬 App Address: ABC123...XYZ
```

## 5️⃣ Update Environment Variables

Copy the App ID and Address from step 4.

Edit `.env`:
```bash
VITE_APP_ID=123456789
VITE_APP_ADDRESS=ABC123...XYZ
```

Edit `backend/.env`:
```bash
ALGORAND_APP_ID=123456789
ALGORAND_APP_ADDRESS=ABC123...XYZ
```

## 6️⃣ Start the Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 7️⃣ Open in Browser

Navigate to: http://localhost:3000

Click "Connect Wallet" and start using CredChain!

---

## 🎯 What's Next?

### As Platform Admin:
1. Go to "Platform Admin"
2. Register colleges
3. Manage platform settings

### As College Admin:
1. Go to "College Admin"
2. Review credential requests
3. Approve/reject credentials

### As Student:
1. Go to "Student Dashboard"
2. Upload credentials
3. View your NFT credentials

### Verify Credentials:
1. Go to "Verify Credential"
2. Enter credential ID
3. See instant verification

---

## 🆘 Troubleshooting

**"Insufficient balance" error:**
- Get more TestNet ALGO from https://bank.testnet.algorand.network/

**"Connection failed" error:**
- Make sure your wallet is connected
- Try refreshing the page

**"Module not found" error:**
- Run `npm run setup` again
- Run `pip install -r requirements.txt` in contracts folder

**Contract deployment fails:**
- Check your mnemonic phrase (should be 25 words)
- Verify wallet has ALGO balance
- Make sure Python dependencies are installed

---

## 📚 Full Documentation

For detailed information, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `contracts/README.md` - Smart contract documentation
- `DOCUMENTATION_INDEX.md` - All documentation

---

**That's it! You're ready to use CredChain! 🎉**
