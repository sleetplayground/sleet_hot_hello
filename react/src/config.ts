const contractPerNetwork = {
  mainnet: 'hello.sleet.near',
  testnet: 'hello.sleet.testnet',
};

const nearBlocksPerNetwork = {
  mainnet: 'https://nearblocks.io',
  testnet: 'https://testnet.nearblocks.io',
};

const rpcPerNetwork = {
  mainnet: 'https://free.rpc.fastnear.com',
  testnet: 'https://test.rpc.fastnear.com',
};

// Function to get the current network ID from localStorage
export function getCurrentNetworkId(): 'mainnet' | 'testnet' {
  return (localStorage.getItem('networkId') as 'mainnet' | 'testnet') || 'testnet';
}

// Functions to get the current configuration based on the network ID
export function getHelloContract(): string {
  const networkId = getCurrentNetworkId();
  return contractPerNetwork[networkId];
}

export function getNearBlocksUrl(): string {
  const networkId = getCurrentNetworkId();
  return nearBlocksPerNetwork[networkId];
}

export function getNearRpc(): string {
  const networkId = getCurrentNetworkId();
  return rpcPerNetwork[networkId];
}