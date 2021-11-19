import React, { useState } from 'react';
import styled from 'styled-components';
import { Translation, AccountLabeling } from '@suite-components';
import {
    Button,
    Icon,
    Input,
    P,
    SelectBar,
    Tooltip,
    Truncate,
    useTheme,
    variables,
} from '@trezor/components';
import { TypedFieldError } from '@wallet-types/form';
import { useCoinmarketExchangeOffersContext } from '@wallet-hooks/useCoinmarketExchangeOffers';
import { InputError } from '@wallet-components';
import useDebounce from 'react-use/lib/useDebounce';
import BigNumber from 'bignumber.js';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
`;

const LabelText = styled.div`
    font-size: ${variables.FONT_SIZE.TINY};
    color: ${props => props.theme.TYPE_LIGHT_GREY};
`;

const Value = styled.div`
    padding-top: 6px;
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${props => props.theme.TYPE_DARK_GREY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const BreakableValue = styled(Value)`
    word-break: break-all;
`;

const ButtonWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 20px;
    border-top: 1px solid ${props => props.theme.STROKE_GREY};
    margin: 20px 0;
`;

const Row = styled.div`
    margin: 10px 24px;
`;

const Address = styled.div``;

const Columns = styled.div`
    padding-top: 6px;
    display: flex;
    flex-direction: row;
`;

const SlippageColumns = styled(Columns)`
    padding-top: 6px;
`;

const LeftColumn = styled.div`
    display: flex;
    flex: 1;
`;

const RightColumn = styled.div`
    display: flex;
    justify-content: flex-end;
    flex: 1;
`;

const Slippage = styled.div`
    color: ${props => props.theme.TYPE_DARK_GREY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const SlippageSettingsRow = styled.div`
    margin: 0 24px;
    min-height: 65px;
`;

const SlippageSettingsButton = styled.button`
    background: none;
    border: 0;
    margin: 0 3px 0 15px;
    cursor: pointer;
    display: inline-block;
    width: 25px;
    height: auto;
    position: relative;
    line-height: 1;
`;

const StyledInput = styled(Input)`
    display: flex;
    flex: 1;
    max-width: 70px;
`;

const slippageOptions = [
    {
        label: '0.1%',
        value: '0.1',
    },
    {
        label: '0.5%',
        value: '0.5',
    },
    {
        label: '1%',
        value: '1',
    },
    {
        label: '3%',
        value: '3',
    },
    {
        label: <Translation id="TR_EXCHANGE_SWAP_SLIPPAGE_CUSTOM" />,
        value: 'CUSTOM',
    },
];

const SendSwapTransactionComponent = () => {
    const theme = useTheme();
    const { account, callInProgress, selectedQuote, exchangeInfo, confirmTrade, sendTransaction } =
        useCoinmarketExchangeOffersContext();
    const [slippageSettings, setSlippageSettings] = useState(false);
    const [slippage, setSlippage] = useState(selectedQuote?.swapSlippage || '1');
    const [customSlippage, setCustomSlippage] = useState(slippage);
    const [customSlippageError, setCustomSlippageError] = useState<TypedFieldError | undefined>();
    useDebounce(
        () => {
            if (
                selectedQuote &&
                selectedQuote?.dexTx &&
                !customSlippageError &&
                customSlippage !== selectedQuote.swapSlippage
            ) {
                selectedQuote.swapSlippage = customSlippage;
                selectedQuote.approvalType = undefined;
                confirmTrade(selectedQuote.dexTx.from);
            }
        },
        500,
        [customSlippage, slippage],
    );

    if (!selectedQuote) return null;

    const { exchange, dexTx } = selectedQuote;
    if (!exchange || !dexTx) return null;

    const providerName =
        exchangeInfo?.providerInfos[exchange]?.companyName || selectedQuote.exchange;

    const translationValues = {
        value: selectedQuote.approvalStringAmount,
        send: selectedQuote.send,
        provider: providerName,
    };

    const toggleSlippage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setSlippageSettings(!slippageSettings);
    };

    const selectedSlippage = slippageOptions.find(o => o.value === slippage)?.value || 'CUSTOM';

    const changeSlippage = (value: string) => {
        setSlippage(value);
        if (value !== 'CUSTOM') {
            setCustomSlippage(value);
            selectedQuote.swapSlippage = value;
            selectedQuote.approvalType = undefined;
            confirmTrade(dexTx.from);
        }
    };

    const changeCustomSlippage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setCustomSlippage(value);
        if (!value) {
            setCustomSlippageError({
                type: 'error',
                message: 'TR_EXCHANGE_SWAP_SLIPPAGE_NOT_SET',
            });
            return;
        }
        const slippage = new BigNumber(value);
        if (slippage.isNaN() || value.startsWith('.') || value.endsWith('.')) {
            setCustomSlippageError({
                type: 'error',
                message: 'TR_EXCHANGE_SWAP_SLIPPAGE_NOT_NUMBER',
            });
        } else if (slippage.lt('0.1') || slippage.gt('50')) {
            setCustomSlippageError({
                type: 'error',
                message: 'TR_EXCHANGE_SWAP_SLIPPAGE_NOT_IN_RANGE',
            });
        } else {
            setCustomSlippageError(undefined);
        }
    };

    return (
        <Wrapper>
            <Row>
                <LabelText>
                    <Translation id="TR_EXCHANGE_SEND_FROM" />
                </LabelText>
                <Value>
                    <AccountLabeling account={account} />
                </Value>
            </Row>
            <Row>
                <LabelText>
                    <Translation id="TR_EXCHANGE_SWAP_SEND_TO" values={translationValues} />
                </LabelText>
                <Value>
                    <Address>{dexTx.to}</Address>
                </Value>
            </Row>
            <Row>
                <LabelText>
                    <Translation id="TR_EXCHANGE_SWAP_SLIPPAGE" />
                </LabelText>
                <SlippageColumns>
                    <LeftColumn>
                        <Slippage>
                            <Tooltip
                                content={<Translation id="TR_EXCHANGE_SWAP_SLIPPAGE_INFO" />}
                                dashed
                            >
                                <Translation id="TR_EXCHANGE_SWAP_SLIPPAGE_TOLERANCE" />
                            </Tooltip>
                        </Slippage>
                    </LeftColumn>
                    <RightColumn>
                        <Slippage>{selectedQuote.swapSlippage}%</Slippage>
                        <SlippageSettingsButton type="button" onClick={toggleSlippage}>
                            <Icon
                                icon={slippageSettings ? 'ARROW_UP' : 'ARROW_DOWN'}
                                color={theme.TYPE_DARK_GREY}
                                size={14}
                            />
                        </SlippageSettingsButton>
                    </RightColumn>
                </SlippageColumns>
            </Row>
            {slippageSettings && (
                <SlippageSettingsRow>
                    <Columns>
                        <LeftColumn>
                            <SelectBar
                                selectedOption={selectedSlippage}
                                options={slippageOptions}
                                onChange={changeSlippage}
                            />
                        </LeftColumn>
                        {slippage === 'CUSTOM' && (
                            <RightColumn>
                                <StyledInput
                                    monospace
                                    noTopLabel
                                    value={customSlippage}
                                    variant="small"
                                    state={customSlippageError ? 'error' : 'success'}
                                    name="CustomSlippage"
                                    data-test="CustomSlippage"
                                    onChange={changeCustomSlippage}
                                    bottomText={<InputError error={customSlippageError} />}
                                />
                            </RightColumn>
                        )}
                    </Columns>
                </SlippageSettingsRow>
            )}
            <Row>
                <LabelText>
                    <Translation id="TR_EXCHANGE_SWAP_DATA" />
                </LabelText>
                <BreakableValue>
                    <P size="small">
                        <Truncate>{dexTx.data}</Truncate>
                    </P>
                </BreakableValue>
            </Row>
            <ButtonWrapper>
                <Button
                    isLoading={callInProgress}
                    isDisabled={callInProgress}
                    onClick={sendTransaction}
                >
                    <Translation id="TR_EXCHANGE_CONFIRM_ON_TREZOR_SEND" />
                </Button>
            </ButtonWrapper>
        </Wrapper>
    );
};

export default SendSwapTransactionComponent;
