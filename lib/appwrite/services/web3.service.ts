/**
 * Web3 Service (Stub)
 * TODO: Implement when Web3 features are needed
 */

export class Web3Service {
  async getUserWallets(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getUserWallets not implemented');
    return [];
  }
}

export const web3Service = new Web3Service();
