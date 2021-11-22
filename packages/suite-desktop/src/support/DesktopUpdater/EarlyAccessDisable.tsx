import React, { useCallback } from 'react';

import { Button } from '@trezor/components';
import { Translation, Modal, Image } from '@suite-components';
import { BoxImageWrapper, ButtonWrapper, Description, LeftCol, RightCol, Title } from './styles';

interface Props {
    hideWindow: () => void;
}

const EarlyAccessDisable = ({ hideWindow }: Props) => {
    const allowPrerelease = useCallback(() => {
        window.desktopApi?.allowPrerelease(false);
        hideWindow();
    }, [hideWindow]);

    return (
        <Modal>
            <BoxImageWrapper>
                <Image width={60} height={60} image="EARLY_ACCESS_DISABLE" />
            </BoxImageWrapper>
            <Title>
                <Translation id="TR_EARLY_ACCESS_DISABLE_CONFIRM_TITLE" />
            </Title>
            <Description>
                <Translation id="TR_EARLY_ACCESS_DISABLE_CONFIRM_DESCRIPTION" />
            </Description>

            <ButtonWrapper>
                <LeftCol>
                    <Button onClick={hideWindow} variant="secondary" fullWidth>
                        <Translation id="TR_CANCEL" />
                    </Button>
                </LeftCol>
                <RightCol>
                    <Button onClick={allowPrerelease} fullWidth>
                        <Translation id="TR_EARLY_ACCESS_DISABLE" />
                    </Button>
                </RightCol>
            </ButtonWrapper>
        </Modal>
    );
};

export default EarlyAccessDisable;
