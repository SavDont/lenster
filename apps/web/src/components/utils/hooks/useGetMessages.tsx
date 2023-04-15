import type { Conversation } from '@xmtp/xmtp-js';
import { DecodedMessage, SortDirection } from '@xmtp/xmtp-js';
import { MESSAGE_PAGE_LIMIT } from 'data/constants';
import { useEffect, useState } from 'react';
import { useMessageStore } from 'src/store/message';

export class DecodedMessageWithMoonlight extends DecodedMessage {
  isMoonlight: boolean = false;
  moonlightType?: string = '';
  moonlightAmount?: string;
  moonlightToken?: string;
  moonlightTo?: string;
  moonlightFrom?: string;
  moonlightTxHash?: string;
}

const detectMoonlightMessage = (message: DecodedMessage) => {
  const paymentRequestE =
    /#Moonlight - .+ sent you a payment request:\nAmount: (?<amount>[\d.]*)\nToken: (?<token>\w*)\nAddress: (?<to>\w*)/;
  if (message.content.startsWith('#Moonlight')) {
    const m = paymentRequestE.exec(message.content);
    if (m) {
      console.log('Detected moonlight message', message.content);
      return {
        isMoonlight: true,
        moonlightType: 'request',
        moonlightAmount: m.groups?.amount,
        moonlightToken: m.groups?.token,
        moonlightTo: m.groups?.to,
        moonlightFrom: m.groups?.from,
        moonlightTxHash: m.groups?.txHash,
        ...message
      } as DecodedMessageWithMoonlight;
    }
  }
  return {
    isMoonlight: false,
    ...message
  } as DecodedMessageWithMoonlight;
};

const useGetMessages = (conversationKey: string, conversation?: Conversation, endTime?: Date) => {
  const messages = useMessageStore((state) => state.messages.get(conversationKey))?.map(
    detectMoonlightMessage
  );
  const addMessages = useMessageStore((state) => state.addMessages);
  const [hasMore, setHasMore] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const loadMessages = async () => {
      const newMessages = await conversation.messages({
        direction: SortDirection.SORT_DIRECTION_DESCENDING,
        limit: MESSAGE_PAGE_LIMIT,
        endTime: endTime
      });
      if (newMessages.length > 0) {
        addMessages(conversationKey, newMessages);
        if (newMessages.length < MESSAGE_PAGE_LIMIT) {
          hasMore.set(conversationKey, false);
          setHasMore(new Map(hasMore));
        } else {
          hasMore.set(conversationKey, true);
          setHasMore(new Map(hasMore));
        }
      } else {
        hasMore.set(conversationKey, false);
        setHasMore(new Map(hasMore));
      }
    };
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, conversationKey, endTime]);

  return {
    messages,
    hasMore: hasMore.get(conversationKey) ?? false
  };
};

export default useGetMessages;
