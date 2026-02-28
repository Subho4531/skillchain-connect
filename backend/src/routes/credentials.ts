import express from 'express';
import multer from 'multer';
import { authenticateWallet, requireRole, AuthRequest } from '../middleware/auth';
import { mockDb } from '../config/mock-database';
import { ipfsService } from '../services/ipfs.service';
import { nftService } from '../services/nft.service';
import { contractService } from '../services/contract.service';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Student: Upload credential request
router.post(
  '/upload',
  authenticateWallet,
  requireRole('STUDENT'),
  upload.single('document'),
  async (req: AuthRequest, res) => {
    try {
      const { credential_id, degree_name, graduation_year } = req.body;
      const file = req.file;

      if (!file || !credential_id || !degree_name || !graduation_year) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for duplicate credential_id
      const { data: existing } = await mockDb.checkDuplicateCredentialId(credential_id);

      if (existing) {
        return res.status(400).json({ error: 'Credential ID already exists' });
      }

      // Upload document to IPFS
      const { cid, hash } = await ipfsService.uploadFile(file.buffer, file.originalname);

      // Insert into database
      const { data, error } = await mockDb.insertCredentialRequest({
        credential_id,
        student_wallet: req.wallet!,
        degree_name,
        graduation_year: parseInt(graduation_year),
        document_ipfs_cid: cid,
        document_hash: hash,
        status: 'PENDING',
      });

      if (error) throw error;

      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Student: Get my requests
router.get('/my-requests', authenticateWallet, requireRole('STUDENT'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await mockDb.getCredentialRequestsByWallet(req.wallet!);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    res.json({ data: data || [] });
  } catch (error: any) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch requests' });
  }
});

// College Admin: Get pending requests
router.get('/pending', authenticateWallet, requireRole('COLLEGE_ADMIN'), async (req: AuthRequest, res) => {
  try {
    // Verify wallet matches on-chain college admin
    const isValid = await contractService.verifyCollegeAdmin(req.wallet!);
    if (!isValid) {
      return res.status(403).json({ error: 'Wallet not authorized as college admin' });
    }

    const { data, error } = await mockDb.getPendingRequests();

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// College Admin: Approve credential
router.post('/approve/:id', authenticateWallet, requireRole('COLLEGE_ADMIN'), async (req: AuthRequest, res) => {
  try {
    // Verify wallet matches on-chain college admin
    const isValid = await contractService.verifyCollegeAdmin(req.wallet!);
    if (!isValid) {
      return res.status(403).json({ error: 'Wallet not authorized as college admin' });
    }

    const { id } = req.params;

    // Get request
    const { data: request, error: fetchError } = await mockDb.getCredentialRequestById(id);

    if (fetchError || !request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    // Mint NFT
    const nftResult = await nftService.mintCredentialNFT({
      credentialId: request.credential_id,
      studentWallet: request.student_wallet,
      degreeName: request.degree_name,
      graduationYear: request.graduation_year,
      documentCid: request.document_ipfs_cid,
      documentHash: request.document_hash,
    });

    // Insert credential record
    const { error: credError } = await mockDb.insertCredential({
      credential_request_id: request.id,
      nft_asset_id: nftResult.assetId,
      metadata_ipfs_cid: nftResult.metadataCid,
      metadata_hash: nftResult.metadataHash,
      issued_tx_hash: nftResult.txHash,
    });

    if (credError) throw credError;

    // Update request status
    const { error: updateError } = await mockDb.updateCredentialRequest(id, { status: 'APPROVED' });

    if (updateError) throw updateError;

    res.json({
      success: true,
      assetId: nftResult.assetId,
      txHash: nftResult.txHash,
    });
  } catch (error: any) {
    console.error('Approval error:', error);
    res.status(500).json({ error: error.message });
  }
});

// College Admin: Reject credential
router.post('/reject/:id', authenticateWallet, requireRole('COLLEGE_ADMIN'), async (req: AuthRequest, res) => {
  try {
    const isValid = await contractService.verifyCollegeAdmin(req.wallet!);
    if (!isValid) {
      return res.status(403).json({ error: 'Wallet not authorized as college admin' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const { error } = await mockDb.updateCredentialRequest(id, { 
      status: 'REJECTED', 
      rejection_reason: reason 
    });

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
