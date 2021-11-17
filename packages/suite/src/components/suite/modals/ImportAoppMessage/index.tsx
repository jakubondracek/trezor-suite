import React, { useState, useRef } from 'react';
import { Button, Textarea } from '@trezor/components';
import { Modal } from '@suite-components';
import { PROTOCOL_SCHEME } from '@suite-support/Protocol';
import { getProtocolInfo } from '@suite-utils/parseUri';
import QrScanner from '../QrScanner';
import type { TrezorDevice } from '@suite-types';
import type { UserContextPayload } from '@suite-actions/modalActions';

type QRDecision = Extract<UserContextPayload, { type: 'qr-reader' }>['decision'];
type AOPPInfo = Extract<
    NonNullable<ReturnType<typeof getProtocolInfo>>,
    { scheme: PROTOCOL_SCHEME.AOPP }
>;
type Props = Extract<UserContextPayload, { type: 'import-aopp-message' }> & {
    device?: TrezorDevice;
    onCancel: () => void;
};

const validate = (uri: string, _symbol: Props['symbol']) => {
    const info = getProtocolInfo(uri);
    // TODO: find network by symbol and validate correctly
    if (!info || info.scheme !== 'aopp') return;
    // if (info.asset === 'btc' && info.format !== 'any') return;
    return info;
};

// Import AOPP message from url or QR code.

const ImportAoppMessage = ({ device, symbol, decision, onCancel }: Props) => {
    const [qrMode, setQrMode] = useState(false);
    const [info, setInfo] = useState<AOPPInfo | undefined>(undefined);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    if (device?.unavailableCapabilities?.aopp) {
        // device FW is too old, fallback...
        return (
            <Modal cancelable onCancel={onCancel} heading={<div>Import AOPP</div>}>
                FW is too old, pls update...
            </Modal>
        );
    }

    if (qrMode) {
        const qrDecision = {
            resolve: (result: Record<string, string | undefined>) => {
                if (validate(result.uri || '', symbol)) {
                    decision.resolve({
                        message: result.message || '',
                        callback: result.callback,
                    });
                }
            },
            reject: decision.reject,
            promise: decision.promise as QRDecision['promise'],
        };
        // override QrScanner decision with import decision.
        return <QrScanner decision={qrDecision} onCancel={onCancel} />;
    }

    // import textarea, with uri validation using
    return (
        <Modal cancelable onCancel={onCancel} heading={<div>Import AOPP</div>}>
            Some explanation what it is and how to obtain this url.
            <Textarea
                innerRef={textareaRef}
                onChange={e => {
                    setInfo(validate(e.target.value, symbol));
                    console.log('inner ref', textareaRef.current?.value, info);
                }}
            />
            <Button
                disabled={!info}
                onClick={() => {
                    console.warn('INFO', info);
                    decision.resolve({
                        message: info!.msg ?? '',
                        callback: info!.callback,
                    });
                    onCancel();
                }}
            >
                Import
            </Button>
            <Button onClick={() => setQrMode(true)}>Switch to QR</Button>
        </Modal>
    );
};

export default ImportAoppMessage;
