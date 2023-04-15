import type { Conversation } from '@xmtp/xmtp-js';
import { useCallback } from 'react';

const formatPaymentRequest = (amount: string, token: string, to: string) =>
  `#Moonlight - [Name] sent you a payment request:\nAmount: ${amount}\nToken: ${token}\nAddress: ${to}`;

const useSendPaymentRequest = (conversation?: Conversation) => {
  const sendPaymentRequest = useCallback(
    async (amount: string, token: string, to?: string): Promise<boolean> => {
      if (!conversation) {
        return false;
      }
      try {
        if (!to) {
          to = ''; // TODO
        }
        const message = formatPaymentRequest(amount, token, to);
        await conversation.send(message);
      } catch (error) {
        return false;
      }
      return true;
    },
    [conversation]
  );

  return { sendPaymentRequest };
};

export default useSendPaymentRequest;
