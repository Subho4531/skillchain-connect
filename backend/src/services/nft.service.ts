import algosdk from 'algosdk';
import { algodClient, getCollegeAdminAccount } from '../config/algorand';
import { config } from '../config/env';
import { ipfsService } from './ipfs.service';

export class NFTService {
  async mintCredentialNFT(params: {
    credentialId: string;
    studentWallet: string;
    degreeName: string;
    graduationYear: number;
    documentCid: string;
    documentHash: string;
  }): Promise<{ assetId: number; txHash: string; metadataCid: string; metadataHash: string }> {
    
    // Step 1: Create metadata JSON
    const metadata = {
      credential_id: params.credentialId,
      student_wallet: params.studentWallet,
      degree_name: params.degreeName,
      graduation_year: params.graduationYear,
      document_ipfs_cid: params.documentCid,
      document_hash: params.documentHash,
      verified_by: config.collegeAdminWallet,
      issued_at: new Date().toISOString(),
    };

    // Step 2: Upload metadata to IPFS
    const { cid: metadataCid, hash: metadataHash } = await ipfsService.uploadJSON(metadata);

    // Step 3: Get college admin account
    const collegeAdmin = getCollegeAdminAccount();

    // Step 4: Get suggested params
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Step 5: Create ASA
    const metadataHashBuffer = Buffer.from(metadataHash, 'hex').slice(0, 32);

    const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: collegeAdmin.addr,
      total: 1,
      decimals: 0,
      assetName: params.degreeName.substring(0, 32),
      unitName: 'DEGREE',
      assetURL: `ipfs://${metadataCid}`,
      assetMetadataHash: metadataHashBuffer,
      manager: collegeAdmin.addr,
      reserve: collegeAdmin.addr,
      freeze: collegeAdmin.addr,
      clawback: collegeAdmin.addr,
      defaultFrozen: false,
      suggestedParams,
    });

    // Step 6: Sign and send
    const signedTxn = assetCreateTxn.signTxn(collegeAdmin.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    // Step 7: Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    const assetId = confirmedTxn['asset-index'];

    console.log(`✅ NFT Created: Asset ID ${assetId}`);

    // Step 8: Opt-in student wallet (they need to do this themselves)
    // We'll transfer after they opt-in

    // Step 9: Transfer NFT to student
    await this.transferNFT(assetId, collegeAdmin.addr, params.studentWallet);

    return {
      assetId,
      txHash: txId,
      metadataCid,
      metadataHash,
    };
  }

  async transferNFT(assetId: number, from: string, to: string): Promise<string> {
    const collegeAdmin = getCollegeAdminAccount();
    const suggestedParams = await algodClient.getTransactionParams().do();

    const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: collegeAdmin.addr,
      to,
      amount: 1,
      assetIndex: assetId,
      suggestedParams,
    });

    const signedTxn = transferTxn.signTxn(collegeAdmin.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txId, 4);

    console.log(`✅ NFT Transferred: ${txId}`);

    return txId;
  }
}

export const nftService = new NFTService();
