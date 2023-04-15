import type { Wallet } from 'ethers';
import { ethers, providers } from 'ethers';

import ABI from './abi.json';

async function transfer(
  tokenAddress: string,
  toAddress: string,
  fromAddress: string,
  amount: ethers.BigNumber,
  signer: Wallet
): Promise<void> {
  const rpcUrl = 'https://rpc-mumbai.maticvigil.com';
  const provider = new providers.JsonRpcProvider(rpcUrl);
  if (!tokenAddress) {
    // transfer MATIC
    const transaction = [
      {
        from: fromAddress,
        to: toAddress,
        value: amount.toHexString()
      }
    ];

    const tx = await provider.send('eth_sendTransaction', transaction);
    console.log('transactionHash is ', tx);
  } else {
    const contract = new ethers.Contract(tokenAddress, ABI, signer);
    console.log('contract is ', contract);
    const tx = contract.transfer(toAddress, amount);
    console.log('transactionHash is ', tx);
  }
}

export default transfer;
