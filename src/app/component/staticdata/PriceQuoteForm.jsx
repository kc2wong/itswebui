// @flow
import _ from 'lodash'
import React, { Component } from 'react'
import { Enum } from 'enumify'
import { XaIcon, XcButton, XcButtonGroup, XcDivider, XcForm, XcGrid, XcPanel, XcInputText } from 'shared/component';
import { createNumberFormat, formatNumber, Language, parseBool, xlate } from 'shared/util/lang';
import { BuySell } from 'app/model/EnumType'
import { ThemeContext } from 'shared/component/XaTheme'
import { Currency, PriceQuote } from 'app/model/staticdata'
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { priceQuoteService } from 'app/service';

import { MessageService } from 'shared/service';

class IconStyle extends Enum {}
IconStyle.initEnum({ Play: { value: 'triangle right' }, Refresh: { value: 'refresh' } });

type Props = {
}

type IntProps = {
    messageService: MessageService,
    sessionContext: SessionContextType
}

type State = {
    icon: IconStyle,
    instrumentCode: string,
    loading: boolean,
    priceQuote: ?PriceQuote
}

const formName = "priceQuoteForm"

class PriceQuoteForm extends React.Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);
        this.state = this.defaultState()
    }

    render() {
        const { messageService, sessionContext } = this.props
        const { icon, instrumentCode, loading } = this.state
        const languageContext: LanguageContextType = sessionContext.languageContext
        const cacheContext = sessionContext.cacheContext

        const priceQuote = this.state.priceQuote ? this.state.priceQuote : PriceQuote.newInstance()
        const currency = priceQuote ? cacheContext.getCurrency(priceQuote.currencyCode) : null
        const currencyName = currency ? currency.getDescription(languageContext.language) : ""
        const priceFormat = createNumberFormat(true, currency ? currency.decimalPoint : 2)

        const rowStyle = { paddingBottom: "0.5rem", paddingTop: "0.5rem" }
        const sign = Math.sign(priceQuote.priceChange)
        const arrow = sign > 0 ? "▲" : sign < 0 ? "▼" : ""
        return (
            <ThemeContext.Consumer>
                {theme => (
                    <div style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
                        <br />
                        <XcInputText disabled={loading} icon={{ name: icon.value, onIconClick: this.search }} iconPosition={XcInputText.IconPosition.Right} inline label={xlate(`${formName}.instrumentCode`)} loading={loading} onChange={this.handleChangeInstrumentCode} value={instrumentCode} />
                        <br />
                        {this.state.priceQuote != null && (
                            <XcPanel loading={loading}>
                                <XcPanel.Body>
                                    <XcGrid evenly={true} rowStyle={rowStyle}>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.instrumentName`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{priceQuote.getDescription(languageContext.language)}</XcGrid.Col>
                                        </XcGrid.Row>
                                    </XcGrid>
                                    <br />
                                    <XcDivider />
                                    <br />
                                    <XcGrid evenly={true} rowStyle={rowStyle}>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.nominalPrice`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${formatNumber(priceQuote.nominalPrice, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.closingPrice`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${formatNumber(priceQuote.closingPrice, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row verticalAlign={XcGrid.VerticalAlign.Center}>
                                            <XcGrid.Col>{xlate(`${formName}.change`)}</XcGrid.Col>
                                            {sign != 0 && (
                                                <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}><font color={sign > 0 ? "green" : "red"}>{arrow}{`${priceQuote.priceChange} (${priceQuote.percentChange}%)`}</font></XcGrid.Col>
                                            )}
                                            {sign == 0 && (
                                                <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{arrow}{`${priceQuote.priceChange} (${priceQuote.percentChange}%)`}</XcGrid.Col>
                                            )}
                                        </XcGrid.Row>
                                    </XcGrid>
                                    <br />
                                    <XcDivider />
                                    <br />
                                    <XcGrid evenly={true} rowStyle={rowStyle}>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.bidAsk`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${this.formatPrice(priceQuote.bidPrice, priceFormat)} / ${this.formatPrice(priceQuote.askPrice, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.dailyRange`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${this.formatPrice(priceQuote.dayLow, priceFormat)} - ${this.formatPrice(priceQuote.dayHigh, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                        <XcGrid.Row>
                                            <XcGrid.Col>{xlate(`${formName}.yearlyRange`)}</XcGrid.Col>
                                            <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>{`${this.formatPrice(priceQuote.fiftyTwoWeekLow, priceFormat)} - ${this.formatPrice(priceQuote.fiftyTwoWeekHigh, priceFormat)}`}</XcGrid.Col>
                                        </XcGrid.Row>
                                    </XcGrid>
                                    <br />
                                    <XcDivider />
                                    <br />
                                    <XcGrid.Row>
                                        <XcGrid.Col>
                                            <XcButtonGroup>
                                                <XcButton label={xlate(`enum.buySell.${BuySell.Buy.value}`)} />
                                                <XcButton label={xlate(`enum.buySell.${BuySell.Sell.value}`)} />
                                            </XcButtonGroup>
                                        </XcGrid.Col>
                                    </XcGrid.Row>
                                </XcPanel.Body>
                            </XcPanel>
                        )}
                    </div>
                )}
            </ThemeContext.Consumer>
        )
    }

    handleChangeInstrumentCode = (event: SyntheticInputEvent<>, target: any) => {
        this.setState({ icon: IconStyle.Play, instrumentCode: target.value })
    }

    defaultState = (): Object => {
        return {
            icon: IconStyle.Play,
            instrumentCode: "",
            loading: false,
            priceQuote: null
        }
    }

    formatPrice = (price: ?number, numberFormat: string): string => {
        return price == null ? xlate("priceQuoteForm.notApplicable") : formatNumber(price, numberFormat)
    }

    search = () => {
        const { messageService, sessionContext } = this.props
        const { instrumentCode } = this.state
        this.setState({ loading: true }, () => {
            const promise = priceQuoteService.getOne({exchangeCode: "HKG", instrumentCode: instrumentCode})
            if (promise) {
                promise.then(
                    result => {
                        console.log(result)
                        this.setState({
                            icon: IconStyle.Refresh,
                            priceQuote: result,
                            loading: false
                        })
                    },
                    error => {
                        console.log(error)
                        this.setState({
                            loading: false
                        })
                    }
                )
            }
        })
    }
}

export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <PriceQuoteForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);
