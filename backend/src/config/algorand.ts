import algosdk from 'algosdk';
import { config } from './env';

export const algodClient = new algosdk.Algodv2(
  config.algodToken,
  config.algodServer,
  config.algodPort
);

export const indexerClient = new algosdk.Indexer(
  '',
  config.indexerServer,
  config.indexerPort
);

// Get college admin account
export function getCollegeAdminAccount() {
  const privateKey = algosdk.mnemonicToSecretKey(config.collegeAdminMnemonic);
  return privateKey;
}
