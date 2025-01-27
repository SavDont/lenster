import type { Signer } from 'ethers';
import { ethers } from 'ethers';

import ABI from './abi.json';

async function transfer(
  tokenAddress: string,
  toAddress: string,
  fromAddress: string,
  amount: ethers.BigNumber,
  signer: Signer
): Promise<string> {
  if (!tokenAddress) {
    // transfer MATIC
    const transaction = {
      from: fromAddress,
      to: toAddress,
      value: amount.toHexString()
    };

    const tx = await signer.sendTransaction(transaction);
    console.log('transactionHash is ', tx);
    return tx.hash;
  } else {
    const contract = new ethers.Contract(tokenAddress, ABI, signer);
    console.log('contract is ', contract);
    const tx = await contract.transfer(toAddress, amount);
    console.log('transactionHash is ', tx);
    return tx.hash;
  }
}

export default transfer;
