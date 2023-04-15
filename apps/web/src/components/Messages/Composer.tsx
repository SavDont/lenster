import useWindowSize from '@components/utils/hooks/useWindowSize';
import { ArrowRightIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import { t, Trans } from '@lingui/macro';
import clsx from 'clsx';
import { MIN_WIDTH_DESKTOP } from 'data/constants';
import { ethers } from 'ethers';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { useMessagePersistStore, useMessageStore } from 'src/store/message';
import { MESSAGES } from 'src/tracking';
import { Button, Input, Modal, Select, Spinner } from 'ui';
import { useSigner } from 'wagmi';
interface ComposerProps {
  sendMessage: (message: string) => Promise<boolean>;
  sendPaymentRequest: (amount: string, token: string, to?: string) => Promise<boolean>;
  sendPaymentReceipt: (amount: string, token: string, txHash: string, to?: string) => Promise<boolean>;
  conversationKey: string;
  disabledInput: boolean;
}

const initialPaymentToken = 'MATIC';
const initialPaymentAmount = '0.01';

const Composer: FC<ComposerProps> = ({
  sendMessage,
  sendPaymentRequest,
  sendPaymentReceipt,
  conversationKey,
  disabledInput
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentToken, setPaymentToken] = useState<string>(initialPaymentToken);
  const [paymentAmount, setPaymentAmount] = useState<string>(initialPaymentAmount);
  const [paymentRequesting, setPaymentRequesting] = useState<boolean>(false);

  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const { width } = useWindowSize();
  const unsentMessage = useMessagePersistStore((state) => state.unsentMessages.get(conversationKey));
  const setUnsentMessage = useMessagePersistStore((state) => state.setUnsentMessage);

  const canSendMessage = !disabledInput && !sending && message.length > 0;
  const signer = useSigner();

  const handleSend = async () => {
    if (!canSendMessage) {
      return;
    }
    setSending(true);
    // TODO
    sendPaymentReceipt(
      paymentAmount,
      paymentToken,
      '0x6f19f28e14f30b3da71a6b185b9cf5e241811ac6742e036c047a89c0e1de8fcf'
    );
    const sent = await sendMessage(message);
    if (sent) {
      setMessage('');
      setUnsentMessage(conversationKey, null);
      Mixpanel.track(MESSAGES.SEND);
    } else {
      toast.error(t`Error sending message`);
    }
    setSending(false);
  };

  const paymentClick = () => {
    setShowPaymentModal(true);
  };

  useEffect(() => {
    setMessage(unsentMessage ?? '');
  }, [unsentMessage]);

  const onChangeCallback = (value: string) => {
    setUnsentMessage(conversationKey, value);
    setMessage(value);
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handlePaymentRequest = async () => {
    setPaymentRequesting(true);

    // TODO: validation logic here
    sendPaymentRequest(paymentAmount, paymentToken);
    setPaymentRequesting(false);
    setShowPaymentModal(false);
    setPaymentToken(initialPaymentToken);
    setPaymentAmount(initialPaymentAmount);
  };

  const fromAddress = useAppStore((state) => state.currentProfile)?.ownedBy;
  const toAddress = useMessageStore((state) => state.messageProfiles.get(conversationKey))?.ownedBy;

  const handlePaymentSending = async () => {
    const tokenAddress = paymentToken == 'MATIC' ? '' : '0xE097d6B3100777DC31B34dC2c58fB524C2e76921';
    const qty = ethers.utils.parseUnits(paymentAmount, paymentToken == 'MATIC' ? 18 : 6);
  };

  const onPaymentTokenChange = (value: string) => {
    setPaymentToken(value);
  };

  const onPaymentAmountChange = (value: string) => {
    setPaymentAmount(value);
  };

  return (
    <div className="flex space-x-4 p-4">
      <Input
        type="text"
        placeholder={t`Type Something`}
        value={message}
        disabled={disabledInput}
        onKeyDown={handleKeyDown}
        onChange={(event) => onChangeCallback(event.target.value)}
      />
      <Button onClick={paymentClick} variant="primary" aria-label="Send/Receive Money">
        <div className="flex items-center space-x-2">
          {Number(width) > MIN_WIDTH_DESKTOP ? (
            <span>
              <Trans>$</Trans>
            </span>
          ) : null}
        </div>
      </Button>

      <Button disabled={!canSendMessage} onClick={handleSend} variant="primary" aria-label="Send message">
        <div className="flex items-center space-x-2">
          {Number(width) > MIN_WIDTH_DESKTOP ? (
            <span>
              <Trans>Send</Trans>
            </span>
          ) : null}
          {!sending && <ArrowRightIcon className="h-5 w-5" />}
          {sending && <Spinner size="sm" className="h-5 w-5" />}
        </div>
      </Button>
      <Modal
        title={t`Send/Receive Tokens`}
        size="sm"
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      >
        <div className="w-full px-4 pt-4">
          <Trans>Token</Trans>
          <div className="flex justify-center space-x-4 py-4">
            <Select
              options={['MATIC', 'USDC']}
              value={paymentToken}
              onChange={(value: string) => onPaymentTokenChange(value)}
            />
          </div>
          <Trans>Amount</Trans>
          <div className="flex justify-center space-x-4 py-4">
            <Input
              type="text"
              placeholder={t`0.01`}
              value={paymentAmount}
              onChange={(event) => onPaymentAmountChange(event.target.value)}
            />
          </div>

          <div className="flex">
            <div
              className={clsx(
                'text-brand m-2 ml-4 flex flex-1 cursor-pointer items-center justify-center rounded p-2 font-bold'
              )}
            >
              <Button onClick={handlePaymentSending}>Send</Button>
            </div>
            <div
              className={clsx(
                'text-brand m-2 ml-4 flex flex-1 cursor-pointer items-center justify-center rounded p-2 font-bold'
              )}
            >
              <Button onClick={handlePaymentRequest}>
                <div>
                  {!paymentRequesting && <p>Request</p>}
                  {paymentRequesting && <Spinner size="sm" className="h-5 w-5" />}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Composer;
