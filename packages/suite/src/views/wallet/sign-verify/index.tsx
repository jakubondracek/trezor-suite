import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Button, Textarea, Card, Switch, variables } from '@trezor/components';
import { WalletLayout, WalletLayoutHeader } from '@wallet-components';
import { CharacterCount, Translation } from '@suite-components';
import { useActions, useDevice, useSelector, useTranslation } from '@suite-hooks';
import * as signVerifyActions from '@wallet-actions/signVerifyActions';
import Navigation, { NavPages } from './components/Navigation';
import SignAddressInput from './components/SignAddressInput';
import { useCopySignedMessage } from '@wallet-hooks/sign-verify/useCopySignedMessage';
import {
    useSignVerifyForm,
    SignVerifyFields,
    MAX_LENGTH_MESSAGE,
    MAX_LENGTH_SIGNATURE,
} from '@wallet-hooks/sign-verify/useSignVerifyForm';

const Row = styled.div`
    display: flex;
    justify-content: center;
    & + & {
        padding-top: 12px;
    }
    & > * + * {
        margin-left: 10px;
    }
`;

const StyledButton = styled(Button)`
    width: 230px;
`;

const SwitchWrapper = styled.label`
    display: flex;
    font-size: ${variables.FONT_SIZE.TINY};
    align-items: center;
    height: 100%;
    & > * + * {
        margin-left: 10px;
    }
`;

const Form = styled.form`
    padding: 42px;
`;

const SignVerify = () => {
    const [page, setPage] = useState<NavPages>('sign');

    const { selectedAccount, revealedAddresses } = useSelector(state => ({
        selectedAccount: state.wallet.selectedAccount,
        revealedAddresses: state.wallet.receive,
    }));

    const { isLocked } = useDevice();
    const { translationString } = useTranslation();

    const {
        formDirty,
        formReset,
        formSubmit,
        formValues,
        formErrors,
        formSetSignature,
        formSetAopp,
        messageRef,
        signatureRef,
        hexField,
        addressField,
        pathField,
    } = useSignVerifyForm(page, selectedAccount.account);

    const { sign, verify, openImportModal, openSendModal } = useActions({
        sign: signVerifyActions.sign,
        verify: signVerifyActions.verify,
        openImportModal: signVerifyActions.openImportAoppModal,
        openSendModal: signVerifyActions.openSendAoppModal,
    });

    const onSubmit = async (data: SignVerifyFields) => {
        const { address, path, message, signature, hex, aopp } = data;
        if (page === 'sign') {
            const result = await sign(path, message, hex, aopp);
            if (result?.signSignature) formSetSignature(result.signSignature);
        } else {
            await verify(address, message, signature, hex);
        }
    };

    const errorState = (err?: string) => (err ? 'error' : undefined);

    const { canCopy, copy } = useCopySignedMessage(formValues, selectedAccount.network?.name);

    return (
        <WalletLayout title="TR_NAV_SIGN_VERIFY" account={selectedAccount}>
            <WalletLayoutHeader title="TR_NAV_SIGN_VERIFY">
                {true && (
                    /* TODO: This button available only for networks wit aopp feature */
                    <Button
                        type="button"
                        data-test="@sign-verify/import-aopp"
                        variant="tertiary"
                        onClick={async () => {
                            const r = await openImportModal('btc');
                            formSetAopp(r);
                        }}
                    >
                        Import aopp
                    </Button>
                )}
                {page === 'sign' && canCopy && (
                    <Button type="button" variant="tertiary" onClick={copy}>
                        <Translation id="TR_COPY_TO_CLIPBOARD" />
                    </Button>
                )}
                {formDirty && (
                    <Button type="button" variant="tertiary" onClick={formReset}>
                        <Translation id="TR_CLEAR_ALL" />
                    </Button>
                )}
            </WalletLayoutHeader>
            <Card noPadding>
                <Navigation page={page} setPage={setPage} />
                <Form onSubmit={formSubmit(onSubmit)}>
                    <Row>
                        <Textarea
                            name="message"
                            label={<Translation id="TR_MESSAGE" />}
                            labelRight={
                                <SwitchWrapper>
                                    <Translation id="TR_HEX_FORMAT" />
                                    <Switch {...hexField} isSmall />
                                </SwitchWrapper>
                            }
                            maxLength={MAX_LENGTH_MESSAGE}
                            innerRef={messageRef}
                            state={errorState(formErrors.message)}
                            bottomText={formErrors.message}
                            rows={4}
                            maxRows={4}
                            data-test="@sign-verify/message"
                        >
                            <CharacterCount
                                current={formValues.message?.length || 0}
                                max={MAX_LENGTH_MESSAGE}
                            />
                        </Textarea>
                    </Row>
                    <Row>
                        {page === 'sign' ? (
                            <SignAddressInput
                                name="path"
                                label={<Translation id="TR_ADDRESS" />}
                                account={selectedAccount.account}
                                revealedAddresses={revealedAddresses}
                                error={formErrors.path}
                                data-test="@sign-verify/path"
                                {...pathField}
                            />
                        ) : (
                            <Input
                                name="address"
                                label={<Translation id="TR_ADDRESS" />}
                                type="text"
                                state={errorState(formErrors.address)}
                                bottomText={formErrors.address}
                                data-test="@sign-verify/select-address"
                                {...addressField}
                            />
                        )}
                    </Row>
                    <Row>
                        <Textarea
                            name="signature"
                            label={<Translation id="TR_SIGNATURE" />}
                            maxLength={MAX_LENGTH_SIGNATURE}
                            innerRef={signatureRef}
                            readOnly={page === 'sign'}
                            state={errorState(formErrors.signature)}
                            bottomText={formErrors.signature}
                            rows={4}
                            maxRows={4}
                            placeholder={
                                page === 'sign'
                                    ? translationString('TR_SIGNATURE_AFTER_SIGNING_PLACEHOLDER')
                                    : undefined
                            }
                            data-test="@sign-verify/signature"
                        >
                            {page === 'verify' && (
                                <CharacterCount
                                    current={formValues.signature?.length || 0}
                                    max={MAX_LENGTH_SIGNATURE}
                                />
                            )}
                        </Textarea>
                    </Row>
                    <Row>
                        <StyledButton
                            type="submit"
                            isDisabled={isLocked()}
                            data-test="@sign-verify/submit"
                        >
                            <Translation id={page === 'sign' ? 'TR_SIGN' : 'TR_VERIFY'} />
                        </StyledButton>
                        {formValues.callback && (
                            <StyledButton
                                type="button"
                                variant="secondary"
                                data-test="@sign-verify/send-aopp"
                                isDisabled={!formValues.signature}
                                onClick={async () => {
                                    const r = await openSendModal(
                                        formValues.signature,
                                        formValues.callback,
                                    );
                                    if (r) {
                                        // finish
                                    }
                                    // formSetAopp(r);
                                }}
                            >
                                Send aopp
                            </StyledButton>
                        )}
                    </Row>
                </Form>
            </Card>
        </WalletLayout>
    );
};

export default SignVerify;
