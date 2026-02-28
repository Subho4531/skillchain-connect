# CredChain Quick Reference

## 🚀 Current Status

✅ **Frontend**: http://localhost:3000 (Running)
✅ **Backend**: http://localhost:4000 (Running)
⚠️ **Smart Contract**: Not deployed yet
⚠️ **Database**: Not configured yet

## 🔑 Required Configuration

### 1. Wallets Needed
- Platform Admin Wallet (for contract deployment)
- College Admin Wallet (for NFT minting)
- Fund both at: https://bank.testnet.algorand.network/

### 2. Files to Update
- `contracts/.env` - Add wallet addresses and deployer mnemonic
- `backend/.env` - Add wallet addresses, college admin mnemonic, and App ID
- Supabase - Run migration SQL

## 📋 Deployment Checklist

- [ ] Create two Algorand wallets
- [ ] Fund both with TestNet ALGO
- [ ] Export mnemonics from both wallets
- [ ] Update `contracts/.env`
- [ ] Deploy contract: `cd contracts && python deploy.py`
- [ ] Copy App ID from deployment output
- [ ] Update `backend/.env` with App ID
- [ ] Run SQL migration in Supabase
- [ ] Restart backend server
- [ ] Test wallet connection on frontend

## 🎯 Testing Workflow

### Test 1: Platform Admin
1. Connect with Platform Admin wallet
2. Should redirect to `/admin/platform`
3. Should see contract admin addresses

### Test 2: Student Upload
1. Connect with non-admin wallet
2. Should redirect to `/student`
3. Upload credential request
4. Should see "Pending" status

### Test 3: College Admin Approval
1. Connect with College Admin wallet
2. Should redirect to `/admin/college`
3. Should see pending request
4. Click "Approve & Mint NFT"
5. Wait 10-15 seconds
6. Should see Asset ID

### Test 4: Verify NFT
1. Copy Asset ID
2. Go to https://testnet.algoexplorer.io/
3. Search for Asset ID
4. Verify NFT exists on-chain

## 🔧 Common Commands

```bash
# Start frontend
npm run dev

# Start backend
cd backend && npm run dev

# Deploy contract
cd contracts && python deploy.py

# Install dependencies
npm install
cd backend && npm install
cd contracts && pip install -r requirements.txt
```

## 📊 System Architecture

```
Student Wallet
    ↓
Frontend (Next.js)
    ↓
Backend (Express)
    ↓
├─→ Smart Contract (verify admin)
├─→ IPFS (upload files)
├─→ Algorand (mint NFT)
└─→ Database (store metadata)
```

## 🔒 Security Model

1. **Role Detection**: Server-side only
2. **Admin Verification**: Read from smart contract
3. **Transaction Confirmation**: Wait before DB write
4. **Duplicate Prevention**: Unique credential IDs
5. **Integrity**: SHA256 hashing

## 📁 Key Files

| File | Purpose |
|------|---------|
| `contracts/admin_registry.py` | Smart contract |
| `contracts/deploy.py` | Deployment script |
| `backend/src/services/nft.service.ts` | NFT minting |
| `backend/src/middleware/auth.ts` | Role detection |
| `src/app/student/page.tsx` | Student portal |
| `src/app/admin/college/page.tsx` | College admin |

## 🌐 Important URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- TestNet Faucet: https://bank.testnet.algorand.network/
- AlgoExplorer: https://testnet.algoexplorer.io/
- Supabase: https://supabase.com/

## 💡 Quick Tips

- Always fund wallets before deployment
- Wait for transaction confirmation (10-15 seconds)
- Check backend logs for errors
- Verify App ID is set in backend/.env
- Restart backend after config changes

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Insufficient balance" | Fund wallet at faucet |
| "App ID not configured" | Deploy contract, update .env |
| "Wallet not authorized" | Check wallet address matches .env |
| Database errors | Run migration SQL |
| Backend won't start | Check all env variables set |

## 📚 Documentation

- Full setup: `SETUP_INSTRUCTIONS.md`
- Deployment: `DEPLOYMENT.md`
- Project summary: `PROJECT_SUMMARY.md`
- Main readme: `README.md`

---

**Everything is ready to go! Just configure wallets and deploy the contract.**
