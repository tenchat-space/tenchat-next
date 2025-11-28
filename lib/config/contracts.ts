import addresses from './deployed_addresses.json';
import TenchatTokenABI from './abis/TenchatToken.json';
import TenchatIdentityABI from './abis/TenchatIdentity.json';
import TenchatSignalingABI from './abis/TenchatSignaling.json';
import TenchatMiniAppRegistryABI from './abis/TenchatMiniAppRegistry.json';
import TenchatPredictionABI from './abis/TenchatPrediction.json';
import TenchatSubscriptionABI from './abis/TenchatSubscription.json';

export const CONTRACT_ADDRESSES = {
  TenchatToken: (process.env.NEXT_PUBLIC_TENCHAT_TOKEN_ADDRESS || addresses.TenchatToken) as `0x${string}`,
  TenchatIdentity: (process.env.NEXT_PUBLIC_TENCHAT_IDENTITY_ADDRESS || addresses.TenchatIdentity) as `0x${string}`,
  TenchatSignaling: (process.env.NEXT_PUBLIC_TENCHAT_SIGNALING_ADDRESS || addresses.TenchatSignaling) as `0x${string}`,
  TenchatMiniAppRegistry: (process.env.NEXT_PUBLIC_TENCHAT_REGISTRY_ADDRESS || addresses.TenchatMiniAppRegistry) as `0x${string}`,
  TenchatPrediction: (process.env.NEXT_PUBLIC_TENCHAT_PREDICTION_ADDRESS || addresses.TenchatPrediction) as `0x${string}`,
  TenchatSubscription: (process.env.NEXT_PUBLIC_TENCHAT_SUBSCRIPTION_ADDRESS || addresses.TenchatSubscription) as `0x${string}`,
};

export const CONTRACT_ABIS = {
  TenchatToken: TenchatTokenABI,
  TenchatIdentity: TenchatIdentityABI,
  TenchatSignaling: TenchatSignalingABI,
  TenchatMiniAppRegistry: TenchatMiniAppRegistryABI,
  TenchatPrediction: TenchatPredictionABI,
  TenchatSubscription: TenchatSubscriptionABI,
};

export const TEN_TESTNET_CHAIN = {
  id: 8443, // Wait, is it 8443? The user's previous hardhat config had 8443, but the output said 443 in one place and 8443 in another.
             // Actually, the Ten Testnet chain ID is usually 443 for "Ten" (formerly Obscuro), but let's check the earlier hardhat config.
             // The user explicitly changed it to 8443 in the hardhat config earlier. I will use 8443 but allow override.
             // UPDATE: The README says "chain ID 8443".
  name: 'Ten Testnet',
  network: 'ten-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [process.env.NEXT_PUBLIC_TEN_RPC_URL || 'https://testnet-rpc.ten.xyz/v1/'] },
    default: { http: [process.env.NEXT_PUBLIC_TEN_RPC_URL || 'https://testnet-rpc.ten.xyz/v1/'] },
  },
  blockExplorers: {
    default: { name: 'TenScan', url: 'https://sepolia.tenscan.io/' }, // Checking search result earlier
  },
  testnet: true,
};

