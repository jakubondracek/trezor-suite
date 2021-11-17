import React from 'react';
import { Button } from '@trezor/components';
import { Modal } from '@suite-components';
import type { UserContextPayload } from '@suite-actions/modalActions';

type Props = Extract<UserContextPayload, { type: 'send-aopp-message' }> & {
    onCancel: () => void;
};

// Broadcast AOPP message signature to callback url.

const post = (_sig: string) =>
    // post message here and catch possible error
    true;

const SendAoppMessage = ({ onCancel, decision, signature, callback }: Props) => (
    <Modal cancelable onCancel={onCancel} heading={<div>Send AOPP</div>}>
        Send signature to {callback}?
        <Button
            onClick={async () => {
                const success = await post(signature);
                decision.resolve(success);
            }}
        >
            Resolve (http post)
        </Button>
        <Button onClick={onCancel}>Reject</Button>
    </Modal>
);

export default SendAoppMessage;
