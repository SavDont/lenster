import type { Conversation } from '@xmtp/xmtp-js';
import { useCallback } from 'react';

const formatPaymentReceipt = (
  amount: string,
  token: string,
  to: string,
  txHash: string,
  reference?: string
) => {
  let s = `#Moonlight - [Name] paid you:\nAmount: ${amount}\nToken: ${token}\nAddress: ${to}\nTxHash: ${txHash}`;
  if (reference) {
    s += `\nReference: ${reference}`;
  }
  return s;
};

const useSendPaymentReceipt = (conversation?: Conversation) => {
  const sendPaymentReceipt = useCallback(
    async (
      amount: string,
      token: string,
      txHash: string,
      to?: string,
      reference?: string
    ): Promise<boolean> => {
      if (!conversation) {
        return false;
      }
      try {
        if (!to) {
          to = ''; // TODO
        }
        const message = formatPaymentReceipt(amount, token, to, txHash, reference);
        await conversation.send(message);
      } catch (error) {
        return false;
      }
      return true;
    },
    [conversation]
  );

  return { sendPaymentReceipt };
};

export default useSendPaymentReceipt;
