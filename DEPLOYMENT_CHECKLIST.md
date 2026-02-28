# 🚀 CredChain Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed
- [ ] Algorand wallet created (Pera/Defly/Exodus)
- [ ] TestNet ALGO obtained from https://bank.testnet.algorand.network/
- [ ] Supabase account created
- [ ] Pinata account created

### Environment Setup
- [ ] Cloned repository
- [ ] Ran `npm run setup` or setup script
- [ ] Installed Python dependencies: `cd contracts && pip install -r requirements.txt`
- [ ] All dependencies installed successfully

## Smart Contract Deployment

### Configuration
- [ ] Created `contracts/.env` file
- [ ] Added `PLATFORM_ADMIN_WALLET` address
- [ ] Added `PLATFORM_ADMIN_MNEMONIC` (25 words)
- [ ] Verified wallet has sufficient TestNet ALGO (min 0.1 ALGO)

### Deployment
- [ ] Ran `npm run deploy:contract`
- [ ] Deployment successful
- [ ] Noted App ID: _______________
- [ ] Noted App Address: _______________
- [ ] Saved `DEPLOYMENT_INFO.md` file
- [ ] Verified contract on AlgoExplorer: https://testnet.algoexplorer.io/application/[APP_ID]

## Environment Configuration

### Frontend (.env)
- [ ] Created `.env` file in root
- [ ] Set `VITE_BACKEND_URL=http://localhost:4000`
- [ ] Set `VITE_ALGORAND_NETWORK=testnet`
- [ ] Set `VITE_APP_ID=[YOUR_APP_ID]`
- [ ] Set `VITE_APP_ADDRESS=[YOUR_APP_ADDRESS]`

### Backend (backend/.env)
- [ ] Created `backend/.env` file
- [ ] Set `PORT=4000`
- [ ] Set `SUPABASE_URL`
- [ ] Set `SUPABASE_SERVICE_KEY`
- [ ] Set `PLATFORM_ADMIN_WALLET`
- [ ] Set `ALGORAND_APP_ID=[YOUR_APP_ID]`
- [ ] Set `ALGORAND_APP_ADDRESS=[YOUR_APP_ADDRESS]`
- [ ] Set `PINATA_API_KEY`
- [ ] Set `PINATA_SECRET_KEY`

## Database Setup

### Supabase
- [ ] Created Supabase project
- [ ] Ran migration: `supabase/migrations/001_initial_schema.sql`
- [ ] Ran migration: `supabase/migrations/002_add_rejection_reason.sql`
- [ ] Verified tables created: `colleges`, `credentials`, `nft_metadata`
- [ ] Copied Supabase URL and Service Key to `backend/.env`

## Application Testing

### Backend
- [ ] Started backend: `npm run backend`
- [ ] Backend running on http://localhost:4000
- [ ] No errors in console
- [ ] API endpoints responding

### Frontend
- [ ] Started frontend: `npm run dev`
- [ ] Frontend running on http://localhost:3000
- [ ] No errors in console
- [ ] Page loads successfully

### Wallet Connection
- [ ] Opened http://localhost:3000
- [ ] Clicked "Connect Wallet"
- [ ] Selected wallet provider
- [ ] Wallet connected successfully
- [ ] Wallet address displayed

## Functional Testing

### Platform Admin
- [ ] Connected with platform admin wallet
- [ ] Accessed "Platform Admin" page
- [ ] Can register new colleges
- [ ] College registration works

### College Admin
- [ ] Registered college admin wallet
- [ ] Connected with college admin wallet
- [ ] Accessed "College Admin" page
- [ ] Can view pending credentials

### Student
- [ ] Connected with student wallet
- [ ] Accessed "Student Dashboard"
- [ ] Can upload credential document
- [ ] Upload successful

### Credential Flow
- [ ] Student uploaded credential
- [ ] College admin sees pending credential
- [ ] College admin approved credential
- [ ] NFT minted successfully
- [ ] Student received NFT in wallet
- [ ] Credential visible on AlgoExplorer

### Verification
- [ ] Accessed "Verify Credential" page
- [ ] Entered credential ID
- [ ] Verification successful
- [ ] Correct details displayed

## Production Deployment

### Smart Contract (MainNet)
- [ ] Updated `contracts/.env` with MainNet settings
- [ ] Funded MainNet wallet with real ALGO
- [ ] Deployed to MainNet: `npm run deploy:contract`
- [ ] Noted MainNet App ID
- [ ] Updated environment variables

### Backend Deployment
- [ ] Chose hosting platform (Railway/Render/Heroku)
- [ ] Created new project
- [ ] Connected repository
- [ ] Set environment variables
- [ ] Deployed backend
- [ ] Verified backend URL
- [ ] Updated frontend `.env` with production backend URL

### Frontend Deployment
- [ ] Chose hosting platform (Vercel/Netlify)
- [ ] Connected repository
- [ ] Set environment variables
- [ ] Built frontend: `npm run build`
- [ ] Deployed frontend
- [ ] Verified production URL
- [ ] Tested production site

### Post-Deployment
- [ ] All features working in production
- [ ] Wallet connection works
- [ ] Credential issuance works
- [ ] Verification works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

## Security Checklist

- [ ] `.env` files not committed to Git
- [ ] Mnemonic phrases secure and private
- [ ] API keys rotated for production
- [ ] HTTPS enabled in production
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation in place

## Documentation

- [ ] Updated README.md with production URLs
- [ ] Documented any custom configurations
- [ ] Created user guide (if needed)
- [ ] Documented API endpoints
- [ ] Added troubleshooting section

## Monitoring

- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configured alerts
- [ ] Dashboard for metrics

## Backup & Recovery

- [ ] Database backup configured
- [ ] Smart contract address saved
- [ ] Deployment info documented
- [ ] Recovery procedure documented

## Final Checks

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Analytics set up
- [ ] User feedback mechanism in place

---

## Deployment Status

**Date Started:** _______________
**Date Completed:** _______________
**Deployed By:** _______________

**URLs:**
- Frontend: _______________
- Backend: _______________
- Smart Contract: _______________

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## Quick Reference

### Important Commands
```bash
# Setup
npm run setup
cd contracts && pip install -r requirements.txt

# Deploy Contract
npm run deploy:contract

# Start Development
npm run backend  # Terminal 1
npm run dev      # Terminal 2

# Build Production
npm run build
cd backend && npm run build
```

### Important URLs
- TestNet Dispenser: https://bank.testnet.algorand.network/
- AlgoExplorer TestNet: https://testnet.algoexplorer.io/
- AlgoExplorer MainNet: https://algoexplorer.io/
- Supabase: https://supabase.com/
- Pinata: https://pinata.cloud/

### Support
- Documentation: See `DEPLOYMENT_GUIDE.md`
- Quick Start: See `QUICK_DEPLOY.md`
- Contract Docs: See `contracts/README.md`

---

**✅ Deployment Complete!**
