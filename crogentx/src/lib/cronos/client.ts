// Cronos EVM Client Setup
import { defineChain } from 'viem';

// Define Cronos Mainnet
export const cronosMainnet = defineChain({
  id: 25,
  name: 'Cronos Mainnet',
  nativeCurrency: { name: 'Cronos', symbol: 'CRO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evm.cronos.org'] },
  },
  blockExplorers: {
    default: { name: 'Cronoscan', url: 'https://cronoscan.com' },
  },
  testnet: false,
});

// Define Cronos Testnet
export const cronosTestnet = defineChain({
  id: 338,
  name: 'Cronos Testnet',
  nativeCurrency: { name: 'Test Cronos', symbol: 'TCRO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evm-t3.cronos.org'] },
  },
  blockExplorers: {
    default: { name: 'Cronos Testnet Explorer', url: 'https://testnet.cronoscan.com' },
  },
  testnet: true,
});

// Configuration
export const CRONOS_CHAIN = process.env.NEXT_PUBLIC_CRONOS_TESTNET === 'true' 
  ? cronosTestnet 
  : cronosMainnet;

// API endpoints
export const CRONOS_API_BASE_URL = process.env.NEXT_PUBLIC_CRONOS_API_URL || 
  'https://api.cronoscan.com/api';

// x402 Facilitator endpoint (if available)
export const X402_FACILITATOR_URL = process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 
  'https://x402-api.cronos.org';

// Helper to fetch from Cronos API
export async function fetchFromCronosAPI(endpoint: string, params?: Record<string, string>) {
  const url = new URL(endpoint, CRONOS_API_BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  // Add API key if available
  if (process.env.NEXT_PUBLIC_CRONOS_API_KEY) {
    url.searchParams.append('apikey', process.env.NEXT_PUBLIC_CRONOS_API_KEY);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Cronos API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper to fetch x402 transactions
export async function fetchX402Transactions(params?: {
  address?: string;
  startBlock?: number;
  endBlock?: number;
  limit?: number;
}) {
  // In production, this would call the actual x402 facilitator API
  // For now, we'll structure it to match the expected format
  
  try {
    const response = await fetch(`${X402_FACILITATOR_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`x402 API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch x402 transactions:', error);
    throw error;
  }
}

// Helper to fetch agent information
export async function fetchAgentInfo(agentAddress: string) {
  try {
    const response = await fetch(`${X402_FACILITATOR_URL}/agents/${agentAddress}`);
    
    if (!response.ok) {
      throw new Error(`Agent API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch agent info:', error);
    throw error;
  }
}

// Chain configuration
export const SUPPORTED_CHAIN = CRONOS_CHAIN;

// Explorer URLs
export const EXPLORER_URL = CRONOS_CHAIN.blockExplorers.default.url;
export const TX_EXPLORER_URL = (txHash: string) => `${EXPLORER_URL}/tx/${txHash}`;
export const ADDRESS_EXPLORER_URL = (address: string) => `${EXPLORER_URL}/address/${address}`;

// Faucet URLs
export const TESTNET_FAUCET_URL = 'https://cronos.org/faucet';
export const DEVUSDC_FAUCET_URL = 'https://faucet.cronos.org';

// RPC URLs
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || CRONOS_CHAIN.rpcUrls.default.http[0];
