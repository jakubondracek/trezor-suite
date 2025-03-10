import React from 'react';
import styled from 'styled-components';
import { CoinLogo, variables, Icon, H2 } from '@trezor/components';
import { BuyTrade } from 'invity-api';
import { useCoinmarketBuyOffersContext } from '@wallet-hooks/useCoinmarketBuyOffers';
import Quote from './Quote';
import { Translation } from '@suite-components';
import { CoinmarketRefreshTime } from '@wallet-components';
import { formatCryptoAmount } from '@wallet-utils/coinmarket/coinmarketUtils';
import { InvityAPIReloadQuotesAfterSeconds } from '@wallet-constants/coinmarket/metadata';

interface Props {
    isAlternative?: boolean;
    quotes: BuyTrade[];
}

const Wrapper = styled.div``;
const Quotes = styled.div``;

const StyledQuote = styled(Quote)`
    margin-bottom: 20px;
`;

const Header = styled.div`
    margin: 36px 0 24px 0;
    display: flex;
    justify-content: space-between;
`;

const Left = styled.div``;
const Right = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const SummaryRow = styled.div`
    display: flex;
    align-items: center;
`;

const OrigAmount = styled.div`
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const StyledIcon = styled(Icon)`
    padding: 0 10px;
    margin: 0 20px;
`;

const Text = styled(H2).attrs({
    fontWeight: 400,
})`
    display: flex;
    padding-top: 3px;
    align-items: center;
`;

const Crypto = styled(Text)`
    padding-left: 10px;
`;

const Receive = styled(Text)`
    padding-right: 10px;
`;

const StyledCoinLogo = styled(CoinLogo)``;

const NoQuotes = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    flex: 1;
`;

const List = ({ isAlternative, quotes }: Props) => {
    const { account, quotesRequest, timer } = useCoinmarketBuyOffersContext();

    if (!quotesRequest) return null;
    const { fiatStringAmount, fiatCurrency, cryptoStringAmount, wantCrypto, receiveCurrency } =
        quotesRequest;

    return (
        <Wrapper>
            <Header>
                <Left>
                    {isAlternative ? (
                        <>
                            <SummaryRow>
                                <Text>
                                    {wantCrypto ? '' : `${quotes[0].fiatStringAmount} `}
                                    {quotes[0].fiatCurrency}
                                </Text>
                                <StyledIcon icon="ARROW_RIGHT_LONG" />
                                {wantCrypto && (
                                    <Receive>
                                        {formatCryptoAmount(Number(quotes[0].receiveStringAmount))}
                                    </Receive>
                                )}
                                <StyledCoinLogo size={21} symbol={account.symbol} />
                                <Crypto>{quotes[0].receiveCurrency}</Crypto>
                            </SummaryRow>
                            {!wantCrypto && (
                                <OrigAmount>
                                    ≈ {fiatStringAmount} {fiatCurrency}
                                </OrigAmount>
                            )}
                        </>
                    ) : (
                        <SummaryRow>
                            <Text>
                                {wantCrypto ? '' : `${fiatStringAmount} `}
                                {fiatCurrency}
                            </Text>
                            <StyledIcon icon="ARROW_RIGHT_LONG" />
                            {wantCrypto && (
                                <Receive>{formatCryptoAmount(Number(cryptoStringAmount))}</Receive>
                            )}
                            <StyledCoinLogo size={21} symbol={account.symbol} />
                            <Crypto>{receiveCurrency}</Crypto>
                        </SummaryRow>
                    )}
                </Left>
                {!isAlternative && !timer.isStopped && (
                    <Right>
                        <CoinmarketRefreshTime
                            isLoading={timer.isLoading}
                            refetchInterval={InvityAPIReloadQuotesAfterSeconds}
                            seconds={timer.timeSpend.seconds}
                            label={<Translation id="TR_BUY_OFFERS_REFRESH" />}
                        />
                    </Right>
                )}
            </Header>
            <Quotes>
                {quotes?.length === 0 ? (
                    <NoQuotes>
                        <Translation id="TR_BUY_NO_OFFERS" />
                    </NoQuotes>
                ) : (
                    quotes.map(quote => (
                        <StyledQuote
                            wantCrypto={wantCrypto}
                            key={`${quote.exchange}-${quote.paymentMethod}-${quote.receiveCurrency}`}
                            quote={quote}
                        />
                    ))
                )}
            </Quotes>
        </Wrapper>
    );
};

export default List;
