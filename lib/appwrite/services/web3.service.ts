/**
 * Web3 Service (Stub)
 * TODO: Implement when Web3 features are needed
 */

export class Web3Service {
  async getUserWallets(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getUserWallets not implemented');
    return [];
  }

  async connectWallet(
    _userId: string,
    _address: string,
    _chain: string,
    _walletType: string
  ): Promise<any> {
    console.warn('Web3Service: connectWallet not implemented');
    return null;
  }

  async setPrimaryWallet(_walletId: string, _userId: string): Promise<void> {
    console.warn('Web3Service: setPrimaryWallet not implemented');
  }

  async getUserNFTs(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getUserNFTs not implemented');
    return [];
  }

  async addNFT(_userId: string, _data: Record<string, any>): Promise<any> {
    console.warn('Web3Service: addNFT not implemented');
    return null;
  }

  async setNFTAsProfilePicture(_nftId: string, _userId: string): Promise<void> {
    console.warn('Web3Service: setNFTAsProfilePicture not implemented');
  }

  async getUserTransactions(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getUserTransactions not implemented');
    return [];
  }

  async recordTransaction(_data: Record<string, any>): Promise<any> {
    console.warn('Web3Service: recordTransaction not implemented');
    return null;
  }

  async updateTransactionStatus(_txId: string, _status: string, _blockNumber?: number): Promise<void> {
    console.warn('Web3Service: updateTransactionStatus not implemented');
  }

  async getPendingGifts(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getPendingGifts not implemented');
    return [];
  }

  async createGift(_data: Record<string, any>): Promise<any> {
    console.warn('Web3Service: createGift not implemented');
    return null;
  }

  async claimGift(_giftId: string, _claimTxHash: string): Promise<void> {
    console.warn('Web3Service: claimGift not implemented');
  }

  async getUserHoldings(_userId: string, _chain?: string): Promise<any[]> {
    console.warn('Web3Service: getUserHoldings not implemented');
    return [];
  }

  async updateHoldings(_userId: string, _data: Record<string, any>): Promise<void> {
    console.warn('Web3Service: updateHoldings not implemented');
  }
}

export const web3Service = new Web3Service();
