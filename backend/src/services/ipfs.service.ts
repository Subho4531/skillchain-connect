import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config/env';
import crypto from 'crypto';

export class IPFSService {
  private pinataUrl = 'https://api.pinata.cloud';

  async uploadFile(buffer: Buffer, filename: string): Promise<{ cid: string; hash: string }> {
    const formData = new FormData();
    formData.append('file', buffer, filename);

    const response = await axios.post(`${this.pinataUrl}/pinning/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: config.pinataApiKey,
        pinata_secret_api_key: config.pinataSecret,
      },
    });

    const cid = response.data.IpfsHash;
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return { cid, hash };
  }

  async uploadJSON(data: any): Promise<{ cid: string; hash: string }> {
    const jsonString = JSON.stringify(data);
    const buffer = Buffer.from(jsonString);

    const response = await axios.post(`${this.pinataUrl}/pinning/pinJSONToIPFS`, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: config.pinataApiKey,
        pinata_secret_api_key: config.pinataSecret,
      },
    });

    const cid = response.data.IpfsHash;
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return { cid, hash };
  }
}

export const ipfsService = new IPFSService();
