# Deployment Steps

## Step 1: Fund the Deployer Wallet

**Deployer Address**: `BECT3N3SEMXSJYVL6DWPWSPPQMHVF7ZBQ2U3IA2FPJYWGL4PRSN626W4DM`

1. Go to: https://bank.testnet.algorand.network/
2. Paste the address above
3. Click "Dispense"
4. Wait for confirmation

## Step 2: Update contracts/.env

Add this line to `contracts/.env`:

```
DEPLOYER_MNEMONIC="virus champion maple drink craft buyer toy injury twice fork soldier close extend blame clip attack violin skill obvious gold primary flat assault above baby"
```

Also update:
```
COLLEGE_ADMIN_WALLET=YOUR_COLLEGE_ADMIN_WALLET_ADDRESS
```

## Step 3: Deploy the Contract

```bash
cd contracts
python deploy.py
```

## Step 4: Update Backend Config

After deployment, you'll get an App ID. Update `backend/.env`:

```
ALGORAND_APP_ID=YOUR_APP_ID_HERE
```

## Step 5: Restart Backend

```bash
cd backend
npm run dev
```

---

**Current Status**: Waiting for deployer wallet to be funded
