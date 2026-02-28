import algosdk from 'algosdk';
import { algodClient } from '../config/algorand';
import { config } from '../config/env';

export class ContractService {
  async getAdmins(): Promise<{ platformAdmin: string; collegeAdmin: string }> {
    if (!config.appId) {
      throw new Error('App ID not configured');
    }

    const appInfo = await algodClient.getApplicationByID(config.appId).do();
    const globalState = appInfo.params['global-state'];

    let platformAdmin = '';
    let collegeAdmin = '';

    for (const item of globalState) {
      const key = Buffer.from(item.key, 'base64').toString();
      const value = item.value;

      if (key === 'platform_admin' && value.type === 1) {
        platformAdmin = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'));
      } else if (key === 'college_admin' && value.type === 1) {
        collegeAdmin = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'));
      }
    }

    return { platformAdmin, collegeAdmin };
  }

  async verifyCollegeAdmin(wallet: string): Promise<boolean> {
    try {
      const { collegeAdmin } = await this.getAdmins();
      return wallet === collegeAdmin;
    } catch (error) {
      console.error('Error verifying college admin:', error);
      return false;
    }
  }
}

export const contractService = new ContractService();
