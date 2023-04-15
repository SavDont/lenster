import { ethers, providers, Signer, Wallet } from 'ethers';
import { useEffect, useState } from 'react';
import { useSigner } from 'wagmi';

import Abi from '../../lib/abi.json';

interface TransferOptions {
  senderPrivateKey: string;
  toAddress: string;
  amount: string;
  tokenAddress?: string;
}

const Transfer = () => {
  const [options, setOptions] = useState<TransferOptions>({
    senderPrivateKey: '',
    toAddress: '',
    amount: '',
    tokenAddress: ''
  });

  const [transactionHash, setTransactionHash] = useState('');
  const { data: signer } = useSigner();

  useEffect(() => {
    if (transactionHash) {
      console.log(`Transaction hash: ${transactionHash}`);
    }
  }, [transactionHash]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, [event.target.name]: event.target.value });
  };

  const transfer = async () => {
    const { senderPrivateKey, toAddress, amount, tokenAddress } = options;

    const rpcUrl = 'https://rpc-mumbai.maticvigil.com';
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // await provider.send('eth_requestAccounts', []);
    // const signer = provider.getSigner();
    //const wallet = new Wallet(senderPrivateKey, provider);
    // const { data: signer } = useSigner();

    if (!tokenAddress) {
      const testBn = ethers.BigNumber.from('1000');
      // Native Polygon transfer (MATIC)
      // const value = ethers.utils.parseEther(amount);
      console.log(testBn);
      const transaction = [
        {
          from: '0xB418426ba654d400DC259cE1e50EF299846f34Af',
          to: toAddress,
          value: testBn.toHexString()
        }
      ];

      const tx = await provider.send('eth_sendTransaction', transaction);
      console.log('transactionHash is ', tx);

      // const tx = await signer.sendTransaction(transaction);
      // setTransactionHash(tx.hash);
    } else {
      // ERC20 transfer
      // const testBnn = ethers.BigNumber.from('1000');
      // console.log(testBnn);
      const tokenContract = '0xE097d6B3100777DC31B34dC2c58fB524C2e76921'; // some ERC20 token contract address
      const toAddress = '0x6879fab591ed0d62537a3cac9d7cd41218445a84'; // some address
      const contract = new ethers.Contract(tokenContract, Abi, signer as Signer);
      console.log('You are here', contract);
      const amount = ethers.utils.parseUnits(options.amount, 6);
      console.log('Amount is', amount);
      const signerAddress = await signer?.getAddress();
      console.log('signer Address', signerAddress);
      const tx = contract.transfer(toAddress, amount);
      // const tx = await provider.sekknd({
      //   from: await signer.getAddress(),
      //   to: tokenContract,
      //   data: contract.interface.encodeFunctionData('transfer', [toAddress, amount])
      // });
      console.log('Transaction is', tx);
      console.log(tx);

      setTransactionHash(tx.hash);
    }
  };

  return (
    <div>
      <input
        type="text"
        name="senderPrivateKey"
        placeholder="Sender Private Key"
        value={options.senderPrivateKey}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="toAddress"
        placeholder="To Address"
        value={options.toAddress}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="amount"
        placeholder="Amount"
        value={options.amount}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="tokenAddress"
        placeholder="Token Address (optional)"
        value={options.tokenAddress}
        onChange={handleInputChange}
      />
      <button onClick={transfer}>Transfer</button>
    </div>
  );
};

export default Transfer;
