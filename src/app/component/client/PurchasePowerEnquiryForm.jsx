// @flow
import _ from 'lodash'
import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react';
import { XaIcon, XcDivider, XcGrid, XcOption, XcPanel, XcSelect } from 'shared/component';
import { createNumberFormat, formatNumber, Language, parseBool, xlate } from 'shared/util/lang';
import { ThemeContext } from 'shared/component/XaTheme'
import { Currency } from 'app/model/staticdata'
import { CashPortfolio, TradingAccountPurchasePower } from 'app/model/client';
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { tradingAccountService } from 'app/service';

import { MessageService } from 'shared/service';
import { BASE_CURRENCY } from 'app/constant/ApplicationConstant'

type Props = {
}

type IntProps = {
    messageService: MessageService,
    sessionContext: SessionContextType
}

type State = {
    cashPortfolio: CashPortfolio[],
    currencyCode: string,
    loading: boolean,
    purchasePower: ?TradingAccountPurchasePower
}

const formName = "purchasePowerEnquiryForm"

class PurchasePowerEnquiryForm extends React.Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);
        this.state = this.defaultState()
    }

    componentDidMount() {
        this.search()
    }

    render() {
        const { messageService, sessionContext } = this.props
        const { cashPortfolio, currencyCode, loading } = this.state
        const purchasePower = this.state.purchasePower != null ? this.state.purchasePower : TradingAccountPurchasePower.newInstance()     // dummy value in order to suppress flow warning
        const languageContext: LanguageContextType = sessionContext.languageContext
        const cacheContext = sessionContext.cacheContext

        const currencyOpt = _.map(_.sortBy(cacheContext.getCurrencies(), ['currencyCode']), (c) => (
            new XcOption(c.currencyCode, c.getDescription(languageContext.language))
        ))

        const currency = cacheContext.getCurrency(currencyCode)
        const currencyName = currency ? currency.getDescription(languageContext.language) : ""
        const priceFormat = createNumberFormat(true, currency ? currency.decimalPoint : 2)

        const balanceAmount =  _.sumBy(cashPortfolio, currencyCode == BASE_CURRENCY ? 'balanceAmountBaseCcy' : 'balanceAmount')
        const rowStyle = { paddingBottom: "0.5rem", paddingTop: "0.5rem" }
        return (
            <ThemeContext.Consumer>
                {theme => (
                    <div style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
                        <XcGrid>
                            <XcGrid.Row>
                                <XcGrid.Col width={14}>
                                    <XcSelect disabled={loading} inline label={xlate(`${formName}.summaryInCurrency`)} onChange={this.handleChangeCurrency} options={currencyOpt} value={currencyCode} />
                                </XcGrid.Col>
                                <XcGrid.Col width={2}>
                                    <XaIcon disabled={loading} name="refresh" onClick={this.search} />
                                </XcGrid.Col>
                            </XcGrid.Row>
                        </XcGrid>
                        <br />
                        {this.state.purchasePower != null && (
                            <XcPanel loading={loading}>
                                <XcPanel.Body>
                                    <XcGrid evenly={true} rowStyle={rowStyle}>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.accountBalance`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${formatNumber(balanceAmount, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.cashPurchasePower`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}><b><font color={theme.secondaryVariant}>{`${formatNumber(purchasePower.cashPurchasePower, priceFormat)}`}</font></b></XcGrid.Col>
                                        </XcGrid.Row>
                                    </XcGrid>
                                    <br />
                                    <XcDivider />
                                    <br />
                                    <XcGrid evenly={true} rowStyle={rowStyle}>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.lineType`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{parseBool(purchasePower.applyCreditLineIndicator, false) ? xlate(`${formName}.creditLine`) : xlate(`${formName}.notApplicable`)}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.lineAmount`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${formatNumber(purchasePower.availableCreditLine, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.lineUsage`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${formatNumber(0, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.lineBalance`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}><b><font color={theme.secondaryVariant}>{`${formatNumber(purchasePower.availableCreditLine, priceFormat)}`}</font></b></XcGrid.Col>
                                        </XcGrid.Row>
                                    </XcGrid>
                                    <br />
                                    <XcDivider />
                                    <br />
                                    <XcGrid evenly={true} rowStyle={rowStyle}>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.totalPurchasePower`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}><b><font color={theme.secondaryVariant}>{`${currencyName} ${formatNumber(purchasePower.totalPurchasePower, priceFormat)}`}</font></b></XcGrid.Col>
                                        </XcGrid.Row>
                                    </XcGrid>
                                </XcPanel.Body>
                            </XcPanel>
                        )}
                    </div>
                )}
            </ThemeContext.Consumer>
        )
    }

    handleChangeCurrency = (event: SyntheticInputEvent<>, target: any) => {
        this.setState({ currencyCode: target.value }, () => {
            this.search()
        })
    }

    defaultState = (): Object => {
        return {
            cashPortfolio: [],
            currencyCode: BASE_CURRENCY,
            loading: false,
            purchasePower: null
        }
    }

    search = () => {
        const { messageService, sessionContext } = this.props
        const { currencyCode } = this.state
        const selectedTradingAccount = sessionContext.accountContext.gelectTradingAccount()
        if (selectedTradingAccount) {
            this.setState({ loading: true }, () => {
                const promise = tradingAccountService.getAccountPortfolio(selectedTradingAccount.tradingAccountCode, currencyCode)
                if (promise) {
                    promise.then(
                        result => {
                            this.setState({
                                cashPortfolio: result.tradingAccountPortfolio.cashPortfolio,
                                loading: false,
                                purchasePower: result.tradingAccountPortfolio.purchasePower
                            })
                        },
                        error => {
                            this.setState({
                                loading: false
                            })
                        }
                    )
                }
            })
        }
    }
}

export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <PurchasePowerEnquiryForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);
