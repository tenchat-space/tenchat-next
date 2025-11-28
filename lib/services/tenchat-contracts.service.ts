import { createPublicClient, createWalletClient, http, custom, getContract, type WalletClient, type PublicClient, type Address } from 'viem';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, TEN_TESTNET_CHAIN } from '../config/contracts';

// Define the chain configuration compatible with viem
const tenChain = {
  ...TEN_TESTNET_CHAIN,
  serializers: undefined, // viem chain type compatibility
} as const;

export class TenchatContractsService {
  private publicClient: PublicClient;
  private walletClient: WalletClient | null = null;

  constructor() {
    this.publicClient = createPublicClient({
      chain: tenChain,
      transport: http()
    });
  }

  /**
   * Connect to the user's wallet (e.g. MetaMask)
   */
  async connectWallet(): Promise<Address | null> {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.walletClient = createWalletClient({
        chain: tenChain,
        transport: custom((window as any).ethereum)
      });
      const [address] = await this.walletClient.requestAddresses();
      return address;
    }
    return null;
  }

  getWalletClient() {
    return this.walletClient;
  }

  /**
   * Get contract instances
   */
  get contracts() {
    const getC = (address: Address, abi: any) => getContract({
      address,
      abi,
      client: {
        public: this.publicClient,
        wallet: this.walletClient || undefined
      }
    });

    return {
      token: getC(CONTRACT_ADDRESSES.TenchatToken, CONTRACT_ABIS.TenchatToken),
      identity: getC(CONTRACT_ADDRESSES.TenchatIdentity, CONTRACT_ABIS.TenchatIdentity),
      signaling: getC(CONTRACT_ADDRESSES.TenchatSignaling, CONTRACT_ABIS.TenchatSignaling),
      registry: getC(CONTRACT_ADDRESSES.TenchatMiniAppRegistry, CONTRACT_ABIS.TenchatMiniAppRegistry),
      prediction: getC(CONTRACT_ADDRESSES.TenchatPrediction, CONTRACT_ABIS.TenchatPrediction),
      subscription: getC(CONTRACT_ADDRESSES.TenchatSubscription, CONTRACT_ABIS.TenchatSubscription),
    };
  }

  /**
   * Example: Get user profile from Identity contract
   */
  async getProfile(address: Address) {
    return await this.contracts.identity.read.getProfile([address]);
  }

  /**
   * Example: Place a bet on a prediction market
   */
  async placeBet(marketId: bigint, outcomeIndex: number, amount: bigint) {
    if (!this.walletClient) throw new Error("Wallet not connected");
    const [account] = await this.walletClient.getAddresses();
    
    // First approve tokens
    const { request: approveReq } = await this.publicClient.simulateContract({
      account,
      address: CONTRACT_ADDRESSES.TenchatToken,
      abi: CONTRACT_ABIS.TenchatToken,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.TenchatPrediction, amount]
    });
    await this.walletClient.writeContract(approveReq);

    // Then place bet
    const { request: betReq } = await this.publicClient.simulateContract({
      account,
      address: CONTRACT_ADDRESSES.TenchatPrediction,
      abi: CONTRACT_ABIS.TenchatPrediction,
      functionName: 'placeBet',
      args: [marketId, outcomeIndex, amount]
    });
    return await this.walletClient.writeContract(betReq);
  }
}

export const tenchatContracts = new TenchatContractsService();

