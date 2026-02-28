# CredChain Complete Workflow Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                         │
│  Multi-wallet support: Pera, Defly, Lute, Exodus                │
│  Role-based UI: Platform Admin, College Admin, Student, Public  │
└────────────────────────┬─────────────────────────────────────────┘
                         │ REST API (HTTPS)
┌────────────────────────┴─────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│  - Wallet authentication middleware                              │
│  - Role-based authorization                                      │
│  - NFT minting service                                           │
│  - Verification service                                          │
└──┬────────┬────────┬────────┬─────────────────────────────────────┘
   │        │        │        │
   │        │        │        └─────────────────┐
   │        │        │                          │
┌──┴──┐  ┌─┴──┐  ┌──┴────┐  ┌────────┐  ┌──────┴──────┐
│Supa │  │IPFS│  │Algorand│  │Algorand│  │   Source    │
│base │  │Pin │  │ Algod  │  │Indexer │  │  of Truth   │
│ DB  │  │ata │  │Testnet │  │        │  │  Blockchain │
└─────┘  └────┘  └────────┘  └────────┘  └─────────────┘
```

## Complete End-to-End Workflow

### PHASE 1: Platform Admin Creates Institution

**Actor:** Platform Admin (wallet matches PLATFORM_ADMIN_WALLET env variable)

**Steps:**
1. Platform admin connects wallet via @txnlab/use-wallet
2. Frontend sends wallet address to backend
3. Backend validates: `wallet_address === process.env.PLATFORM_ADMIN_WALLET`
4. Platform admin fills form:
   - Institution name
   - Institution code
   - College admin wallet address
5. Backend creates institution record in database
6. Backend creates user record for college admin:
   - wallet_address: provided address
   - role: 'COLLEGE_ADMIN'
   - institution_id: newly created institution ID
7. Response: Institution created successfully

**No blockchain interaction in this phase**

### PHASE 2: Student Uploads Credential Document

**Actor:** Student (any Algorand wallet)

**Steps:**
1. Student connects wallet
2. Backend checks if user exists:
   - If not exists: Create user with role='STUDENT'
   - If exists: Return existing user
3. Student navigates to dashboard
4. Student fills credential request form:
   - Credential ID (unique identifier)
   - Degree name
   - Graduation year
   - Institution (dropdown from active institutions)
   - PDF document upload
5. Frontend sends FormData to backend
6. Backend validation:
   - Check credential_id is unique
   - Verify institution exists and is ACTIVE
   - Validate file is PDF
7. Backend processing:
   ```javascript
   // Compute document hash
   const documentHash = SHA256(fileBuffer)
   
   // Upload to IPFS
   const documentCID = await uploadToIPFS(fileBuffer, filename)
   
   // Store in database
   INSERT INTO credential_requests (
     credential_id,
     student_wallet,
     institution_id,
     degree_name,
     graduation_year,
     document_ipfs_cid,
     document_hash,
     status: 'PENDING'
   )
   ```
8. Response: Request submitted successfully

**Document is now on IPFS, request is PENDING**

### PHASE 3: College Admin Reviews Request

**Actor:** College Admin (wallet registered by platform admin)

**Steps:**
1. College admin connects wallet
2. Backend validates:
   - User exists
   - User role is 'COLLEGE_ADMIN'
   - User has institution_id
3. Backend fetches PENDING requests:
   ```sql
   SELECT * FROM credential_requests
   WHERE institution_id = admin.institution_id
   AND status = 'PENDING'
   ```
4. College admin sees list of pending requests
5. College admin can:
   - View document from IPFS: `https://gateway.pinata.cloud/ipfs/{CID}`
   - Review student information
   - Decide: APPROVE or REJECT

### PHASE 3A: College Admin Rejects Request

**Steps:**
1. College admin clicks "Reject"
2. Modal opens asking for rejection reason
3. College admin enters reason and confirms
4. Backend updates database:
   ```sql
   UPDATE credential_requests
   SET status = 'REJECTED',
       rejection_reason = 'reason text'
   WHERE id = request_id
   ```
5. Response: Request rejected

**No NFT minted, process ends here**

### PHASE 3B: College Admin Approves Request (NFT Minting)

**This is the most critical phase with real blockchain interaction**

**Steps:**

**Step 1: Prepare NFT Metadata**
```javascript
// Backend creates metadata JSON
const metadata = {
  credential_id: "CRED-2024-001",
  student_wallet: "ALGORAND_ADDRESS",
  institution_name: "MIT",
  degree_name: "Bachelor of Computer Science",
  graduation_year: 2024,
  document_ipfs_cid: "QmXxx...",
  document_hash: "sha256_hex",
  verified_by: "COLLEGE_ADMIN_WALLET",
  issued_at: "2024-01-15T10:30:00Z"
}

// Upload metadata to IPFS
const metadataCID = await uploadJSONToIPFS(metadata)

// Compute SHA256 hash of metadata
const metadataHash = SHA256(JSON.stringify(metadata))
// Result: 32-byte Uint8Array for on-chain storage
```

**Step 2: Create NFT Transaction**
```javascript
// Backend creates unsigned transaction
const createTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
  from: collegeAdminWallet,
  total: 1,                    // Only 1 NFT exists
  decimals: 0,                 // Indivisible
  assetName: "BSc Computer Science",
  unitName: "DEGREE",
  assetURL: `ipfs://${metadataCID}`,
  assetMetadataHash: metadataHashBytes,  // 32-byte hash
  defaultFrozen: false,
  manager: collegeAdminWallet,
  reserve: undefined,
  freeze: undefined,
  clawback: undefined,
  suggestedParams: params
})

// Encode transaction for frontend
const encodedTxn = Buffer.from(
  algosdk.encodeUnsignedTransaction(createTxn)
).toString('base64')

// Send to frontend
return { transaction: encodedTxn, metadata_cid, metadata_hash }
```

**Step 3: Frontend Signs Transaction**
```javascript
// User sees wallet popup
const signedTxns = await wallet.signTransactions([txnBuffer])

// Send signed transaction back to backend
const signedTxnBase64 = Buffer.from(signedTxns[0]).toString('base64')
```

**Step 4: Backend Broadcasts and Confirms**
```javascript
// Convert from base64
const signedTxnBytes = new Uint8Array(Buffer.from(signedTxnBase64, 'base64'))

// Broadcast to Algorand network
const { txId } = await algodClient.sendRawTransaction(signedTxnBytes).do()

// CRITICAL: Wait for confirmation (4 rounds = ~16 seconds)
await algosdk.waitForConfirmation(algodClient, txId, 4)

// Get transaction info
const txInfo = await algodClient.pendingTransactionInformation(txId).do()

// Extract asset ID
const assetId = txInfo['asset-index']
```

**Step 5: Database Write (ONLY AFTER CONFIRMATION)**
```javascript
// Now safe to write to database
INSERT INTO credentials (
  credential_request_id,
  nft_asset_id: assetId,
  metadata_ipfs_cid: metadataCID,
  metadata_hash: metadataHash,
  issued_tx_hash: txId,
  status: 'ACTIVE'
)

UPDATE credential_requests
SET status = 'APPROVED'
WHERE id = request_id
```

**Step 6: Response**
```json
{
  "credential": { ... },
  "asset_id": 123456789,
  "tx_id": "TXHASH..."
}
```

**NFT is now minted and owned by college admin. Student needs to opt-in to receive it.**

### PHASE 4: Public Verification

**Actor:** Anyone (no wallet required)

**Steps:**

**Step 1: User Enters Credential ID**
- Navigate to `/verify`
- Enter credential ID
- Click "Verify"

**Step 2: Backend Verification Process**

```javascript
// 1. Database lookup
const request = await db.query(`
  SELECT cr.*, c.*, i.name as institution_name
  FROM credential_requests cr
  JOIN credentials c ON c.credential_request_id = cr.id
  JOIN institutions i ON i.id = cr.institution_id
  WHERE cr.credential_id = $1
`, [credentialId])

if (!request) return { verified: false, reason: 'NOT_FOUND' }
if (request.status === 'REVOKED') return { verified: false, reason: 'REVOKED' }

// 2. Blockchain verification via Indexer
const assetInfo = await indexerClient.lookupAssetByID(assetId).do()

// Check asset exists
if (!assetInfo.asset) return { verified: false, reason: 'ASSET_NOT_FOUND' }

// Check asset parameters
if (assetInfo.asset.params.total !== 1) return { verified: false }
if (assetInfo.asset.params.decimals !== 0) return { verified: false }

// 3. Ownership verification
const accountInfo = await indexerClient.lookupAccountByID(studentWallet).do()
const assets = accountInfo.account.assets || []
const ownsAsset = assets.some(a => 
  a['asset-id'] === assetId && a.amount === 1
)

if (!ownsAsset) return { verified: false, reason: 'NOT_OWNED' }

// 4. IPFS metadata verification
const metadataFromIPFS = await fetchFromIPFS(metadataCID)

// 5. Hash verification
const computedHash = SHA256(JSON.stringify(metadataFromIPFS))

// Compare three hashes:
// - Computed hash from IPFS data
// - Database stored hash
// - On-chain metadata hash
const onChainHash = Buffer.from(
  assetInfo.asset.params['metadata-hash'], 
  'base64'
).toString('hex')

if (computedHash !== dbHash) return { verified: false, reason: 'HASH_MISMATCH' }
if (computedHash !== onChainHash) return { verified: false, reason: 'CHAIN_MISMATCH' }

// 6. Document hash verification
if (metadataFromIPFS.document_hash !== request.document_hash) {
  return { verified: false, reason: 'DOCUMENT_MISMATCH' }
}

// 7. Log verification
INSERT INTO verifications (
  credential_id,
  result: 'VERIFIED',
  verified_at: NOW(),
  ip_address: req.ip
)

// 8. Return success
return {
  verified: true,
  credential: {
    credential_id,
    student_wallet,
    institution_name,
    degree_name,
    graduation_year,
    nft_asset_id: assetId,
    tx_hash: txId,
    issued_at
  }
}
```

**Step 3: Display Result**
- Green checkmark if verified
- Red X if invalid
- Show all credential details
- Link to Algorand explorer for transaction

## Security Model

### Trust Boundaries

**UNTRUSTED:**
- Frontend (user can modify)
- Client-side role state
- User input

**TRUSTED:**
- Backend validation
- Wallet signatures
- Environment variables

**SOURCE OF TRUTH:**
- Algorand blockchain (ownership)
- IPFS (immutable content)
- Cryptographic hashes (integrity)

**INDEX LAYER:**
- Database (fast queries, not authoritative)

### Security Measures

1. **Wallet Authentication**
   - Every request validates wallet signature
   - Backend checks wallet matches role
   - No client-side role trust

2. **Duplicate Prevention**
   - credential_id unique constraint
   - Check before insert
   - Prevent double minting

3. **Transaction Confirmation**
   - Wait for blockchain confirmation
   - Never assume success
   - Only write DB after confirmation

4. **Hash Verification**
   - SHA256 for documents
   - SHA256 for metadata
   - Compare on-chain vs computed

5. **Rate Limiting**
   - Verification endpoint limited
   - Prevent DoS attacks
   - IP-based tracking

6. **Role Isolation**
   - College admin sees only their institution
   - Students see only their credentials
   - Platform admin isolated function

## Database as Index Layer

The database is NOT the source of truth. It's an index for performance.

**Why?**
- Blockchain queries are slow
- IPFS fetches take time
- Users need instant feedback

**What if database is compromised?**
- Attacker can change DB records
- But verification will fail:
  - Blockchain ownership won't match
  - IPFS metadata hash won't match
  - On-chain hash won't match
- Blockchain + IPFS are immutable

**Verification always checks:**
1. Database (fast lookup)
2. Blockchain (ownership proof)
3. IPFS (metadata content)
4. Hashes (integrity proof)

All four must match for VERIFIED status.
