import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 4000,
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY!,
  
  // Algorand
  algodServer: process.env.ALGORAND_ALGOD_SERVER!,
  algodPort: parseInt(process.env.ALGORAND_ALGOD_PORT || '443'),
  algodToken: process.env.ALGORAND_ALGOD_TOKEN || '',
  indexerServer: process.env.ALGORAND_INDEXER_SERVER!,
  indexerPort: parseInt(process.env.ALGORAND_INDEXER_PORT || '443'),
  
  // Admin Wallets
  platformAdminWallet: process.env.PLATFORM_ADMIN_WALLET!,
  collegeAdminWallet: process.env.COLLEGE_ADMIN_WALLET!,
  collegeAdminMnemonic: process.env.COLLEGE_ADMIN_MNEMONIC!,
  
  // Smart Contract
  appId: parseInt(process.env.ALGORAND_APP_ID || '0'),
  
  // IPFS
  pinataApiKey: process.env.PINATA_API_KEY!,
  pinataSecret: process.env.PINATA_SECRET_KEY!,
};

// Validate required config
const required = [
  'supabaseUrl',
  'supabaseKey',
  'algodServer',
  'platformAdminWallet',
  'collegeAdminWallet',
  'collegeAdminMnemonic',
  'pinataApiKey',
  'pinataSecret',
];

for (const key of required) {
  if (!config[key as keyof typeof config]) {
    throw new Error(`Missing required config: ${key}`);
  }
}
