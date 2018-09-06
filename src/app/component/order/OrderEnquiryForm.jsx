// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Toolbar } from 'app/component/common/Toolbar';
import { BASE_CURRENCY, PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency, Exchange, Instrument } from 'app/model/staticdata'
import { SecurityPositionSummary, TradingAccountPortfolio, TradingAccountPortfolioBundle } from 'app/model/client';
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { tradingAccountService } from 'app/service';

import { XcButton, XcButtonGroup, XcCheckbox, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow, XcInputText } from 'shared/component';
import { XcOption, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Language, Pageable, PageResult, SortDirection } from 'shared/model';
import { MessageService } from 'shared/service'
import { createNumberFormat, formatNumber, roundNumber, xlate } from 'shared/util/lang'
import { formatDateTime } from 'shared/util/dateUtil'

type Props = {
    exchanges: Exchange[]
}

type IntProps = {
    exchanges: Exchange[],
    messageService: MessageService,
    sessionContext: SessionContextType
}

type State = {
    exchangeCode: string,
    lastUpdate: ?Date,
    outstandingOrder: boolean,
    sortBy: string,
    sortDirection: SortDirection,
    securityPositionSummary: Array<Object>,
    instrumentMap: Map<string, Array<Instrument>>
}

const formName = "orderEnquiryForm"

class OrderEnquiryForm extends Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);
        this.state = this.resetState();
    }

    componentDidMount() {
        this.search()
    }

    render() {
        const { exchanges, sessionContext } = this.props
        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const cacheContext = sessionContext.cacheContext
        const language = sessionContext.languageContext.language

        const { exchangeCode, instrumentMap, lastUpdate, outstandingOrder, securityPositionSummary, sortBy, sortDirection } = this.state;
        const exchange = _.find(exchanges, e => e.exchangeCode == exchangeCode)
        const exchangeCurrency = cacheContext.getCurrency(exchange.baseCurrencyCode)
        const baseCurrency = cacheContext.getCurrency(BASE_CURRENCY)

        const exchangeSecPosSum = _.filter(securityPositionSummary, sps => sps.exchangeCode == exchangeCode)
        const totalMarketValueBaseCcy = _.sumBy(exchangeSecPosSum, "marketValueBaseCurrency")
        const data = _.map(exchangeSecPosSum, 
            e => Object.assign({instrumentName: instrumentMap[e.exchangeCode][e.instrumentCode].getDescription(language), 
                marketValuePercent: roundNumber(e.marketValueBaseCurrency * 100 / totalMarketValueBaseCcy, 2) }, e))    
        const percentageAdj = 100 - _.sumBy(data, "marketValuePercent")
        if (percentageAdj > 0 && _.size(data) > 1) {
            const maxEntry = _.maxBy(data, e => new Number(e.marketValuePercent)) 
            maxEntry.marketValuePercent = roundNumber(maxEntry.marketValuePercent + percentageAdj, 2)
        }

        const instrumentCurrencies = new Set(_.map(data, e => e.currencyCode))
        const singleCurrency = _.size(instrumentCurrencies) == 1 && instrumentCurrencies.has(exchange.baseCurrencyCode)
        const totalMarketValue =  singleCurrency ? _.sumBy(data, "marketValue") : totalMarketValueBaseCcy
        const marketValueCurrency = singleCurrency ? exchangeCurrency : baseCurrency

        const dpOpt = _.map(_.range(4), (i) => {
            return new XcOption(`${i}`, `${i}`)
        });

        const numberFormat = createNumberFormat(true, exchangeCurrency != null ? exchangeCurrency.decimalPoint : 2)
        const searchResultColSpec = this.createResultColSpec(cacheContext, language, exchange, sortBy, sortDirection)
        const summary = {
            [searchResultColSpec[_.size(searchResultColSpec) - 3].name]: xlate(`${formName}.totalMarketValue`),
            [searchResultColSpec[_.size(searchResultColSpec) - 2].name]: marketValueCurrency != null ? `${marketValueCurrency.getDescription(language)}  ${formatNumber(totalMarketValue, numberFormat)}` : formatNumber(totalMarketValue, numberFormat),
            [searchResultColSpec[_.size(searchResultColSpec) - 1].name]: formatNumber(_.sumBy(data, "marketValuePercent"), "0.00")
        }

        return (
            <div style={{ height: "100vh" }}>
                <br />
                <XcGrid evenly>
                    <XcGrid.Row>
                        <XcGrid.Col>
                            <XcForm name={formName}>
                                <XcFormGroup>
                                    <XcSelect inline name="exchange" onChange={this.handleSelectExchange} options={exchangeOpt} value={exchangeCode} />
                                    <XcCheckbox inline name="outstandingOrderOnly" onChange={this.handleToggleOutstandOrder} style={XcCheckbox.Style.Toggle} value={outstandingOrder} />
                                </XcFormGroup>
                            </XcForm>
                        </XcGrid.Col>
                        <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>
                            <div>{lastUpdate != null ? xlate("general.lastUpdate", [formatDateTime(lastUpdate)]) : ""}&nbsp;&nbsp;<XcButton icon={{ name: "refresh" }} label="#general.refresh" onClick={this.search} primary /></div>
                        </XcGrid.Col>
                    </XcGrid.Row>
                </XcGrid>
                <br />
                <XcPanel>
                    <XcPanel.Body>
                        <XcGrid>
                            <XcGrid.Row verticalAlign={XcGrid.VerticalAlign.Top}>
                                <XcGrid.Col width={16}>
                                    <XcTable colspec={searchResultColSpec}
                                        data={data}
                                        onSort={this.handleSort}
                                        size={XcTable.Size.Small} summary={summary} />
                                </XcGrid.Col>
                            </XcGrid.Row>
                        </XcGrid>
                    </XcPanel.Body>
                </XcPanel>
            </div>
        )
    }

    handleSearch = (event: SyntheticMouseEvent<>) => {
        // const { pageNum, pageSize } = this.state
        // this.search(pageNum, pageSize)
    }

    handleSort = (sortBy: string, sortDirection : SortDirection) => {
        // const { pageNum, pageSize } = this.state
        const currentSortBy = this.state.sortBy
        const currentSortDirection = this.state.sortDirection
        let { securityPositionSummary } = this.state
        if (currentSortBy == sortBy) {
            // reverse ony
            this.setState({ sortDirection: sortDirection, securityPositionSummary: _.reverse(securityPositionSummary) })
        }
        else {
            securityPositionSummary = _.sortBy(securityPositionSummary, [sortBy])
            if (sortDirection == SortDirection.Descending) {
                securityPositionSummary = _.reverse(securityPositionSummary)
            }
            this.setState({ sortBy: sortBy, sortDirection: sortDirection, securityPositionSummary: securityPositionSummary })
        }
    }

    handleSelectExchange = (event: SyntheticEvent<>, target: any) => {
        event.preventDefault()
        this.setState({ exchangeCode: target.value })
    }

    handleToggleOutstandOrder = (event: SyntheticEvent<>, target: any) => {
        event.preventDefault()
        this.setState({ outstandingOrder: !this.state.outstandingOrder })
    }

    search = () => {
        const { exchanges, messageService, sessionContext } = this.props
        const { exchangeCode, sortBy, sortDirection } = this.state
        const selectedTradingAccount = sessionContext.accountContext.gelectTradingAccount()
        if (selectedTradingAccount) {
            messageService.showLoading()
            const promise = tradingAccountService.getAccountPortfolio(selectedTradingAccount.tradingAccountCode, BASE_CURRENCY)
            if (promise) {
                promise.then(
                    result => {
                        const instrumentMap = new Map()
                        _.forEach(exchanges, e => instrumentMap[e.exchangeCode] = _.keyBy(_.filter(result.instruments, i => e.exchangeCode == i.exchangeCode), 'instrumentCode'))
                        let securityPositionSummary = _.sortBy(result.tradingAccountPortfolio.securityPositionSummary, [sortBy])
                        if (sortDirection == SortDirection.Descending) {
                            securityPositionSummary = _.reverse(securityPositionSummary)
                        }
                        this.setState({ instrumentMap: instrumentMap, lastUpdate: new Date(), securityPositionSummary: securityPositionSummary }, () => {
                            messageService.hideLoading()
                        })
                    },
                    error => {
                        // TODO                
                        messageService.hideLoading()
                    }
                )
            }    
        }
    }

    resetState = (): Object => {
        return {
            exchangeCode: this.props.exchanges[0].exchangeCode,
            lastUpdate: null,
            outstandingOrder: false,        
            sortBy: "instrumentCode",
            sortDirection: SortDirection.Ascending,
            securityPositionSummary: [],
            instrumentMap: new Map()
        }
    }

    portfolioActionSheet = (model: Object) => (
        <XcGrid evenly divider>
            <XcGrid.Row>
                <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Center}><h4>{xlate(`${formName}.topUpTitle`)}</h4>
                    <p style={{whiteSpace : "nowrap"}}>{xlate(`${formName}.topUpHint`)}</p>
                    <XcButton label={xlate(`${formName}.topUpTitle`)} primary />
                </XcGrid.Col>
                <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Center}><h4>{xlate(`${formName}.sellOutTitle`)}</h4>
                    <p style={{whiteSpace : "nowrap"}}>{xlate(`${formName}.sellOutHint`)}</p>
                    <XcButton label={xlate(`${formName}.sellOutTitle`)} primary />
                </XcGrid.Col>
                <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Center}><h4>{xlate(`${formName}.quoteTitle`)}</h4>
                    <p style={{whiteSpace : "nowrap"}}>{xlate(`${formName}.quoteHint`)}</p>
                    <XcButton label={xlate(`${formName}.quoteButton`)} primary />
                </XcGrid.Col>
            </XcGrid.Row>
        </XcGrid>
    )
        
    createResultColSpec = (cacheContext: CacheContextType, language: Language, exchange: Exchange, sortBy: string, sortDirection: SortDirection): XcTableColSpec[] => {
        const exchangeCurrency = cacheContext.getCurrency(exchange["baseCurrencyCode"])
        const quantityFormatter = (model: Object, fieldName: string) => {
            return formatNumber(model[fieldName], createNumberFormat(true, 0))
        }
        const priceFormatter = (model: Object, fieldName: string) => {
            // Do not show currency code if equals to exchange currency
            if (model["currencyCode"] == exchange["baseCurrencyCode"]) {
                return exchangeCurrency != null ? `${formatNumber(model[fieldName], createNumberFormat(true, exchangeCurrency.decimalPoint))}` : model[fieldName]
            }
            else {
                const currency = cacheContext.getCurrency(model["currencyCode"])
                return currency != null ? `${currency.getDescription(language)}  ${formatNumber(model[fieldName], createNumberFormat(true, currency.decimalPoint))}` : model[fieldName]
            }
        }
        const percentFormatter = (model: Object, fieldName: string) => {
            return formatNumber(model[fieldName], createNumberFormat(true, 2))
        }
        const contentProvider = (model: Object, fieldName: string) => {
            return this.portfolioActionSheet(model)
        }
        const resultColName = ["instrumentCode", "instrumentName", "sellableQuantity", "totalQuantity", "closingPrice", "marketValue", "marketValuePercent"]
        const searchResultColInstrumentCode = new XcTableColSpec(resultColName[0], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[0]}`), 2, sortBy == resultColName[0] ? sortDirection : null)
        searchResultColInstrumentCode.actionSheetProvider = contentProvider
        const searchResultColInstrumentName = new XcTableColSpec(resultColName[1], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[1]}`), 3, sortBy == resultColName[1] ? sortDirection : null)
        const searchResultColSellableQuantity = new XcTableColSpec(resultColName[2], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[2]}`), 2, sortBy == resultColName[2] ? sortDirection : null)
        searchResultColSellableQuantity.formatter = quantityFormatter
        searchResultColSellableQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColTotalQuantity = new XcTableColSpec(resultColName[3], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[3]}`), 2, sortBy == resultColName[3] ? sortDirection : null)
        searchResultColTotalQuantity.formatter = quantityFormatter
        searchResultColTotalQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColClosingPrice = new XcTableColSpec(resultColName[4], DataType.Number, `${xlate(`portfolioEnquiryForm.${resultColName[4]}`)}${exchangeCurrency != null ? ` (${exchangeCurrency.getDescription(language)})` : ""}`, 2, sortBy == resultColName[4] ? sortDirection : null)
        searchResultColClosingPrice.formatter = priceFormatter
        searchResultColClosingPrice.horizontalAlign = XcTable.TextAlign.Right
        searchResultColClosingPrice.footerHorizontalAlign = XcTable.TextAlign.Right
        const searchResultColMarketValue = new XcTableColSpec(resultColName[5], DataType.Number, `${xlate(`portfolioEnquiryForm.${resultColName[5]}`)}${exchangeCurrency != null ? ` (${exchangeCurrency.getDescription(language)})` : ""}`, 3, sortBy == resultColName[5] ? sortDirection : null)
        searchResultColMarketValue.formatter = priceFormatter
        searchResultColMarketValue.horizontalAlign = XcTable.TextAlign.Right
        searchResultColMarketValue.footerHorizontalAlign = XcTable.TextAlign.Right
        const searchResultColMarketValuePercent = new XcTableColSpec(resultColName[6], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[6]}`), 2, sortBy == resultColName[6] ? sortDirection : null)
        searchResultColMarketValuePercent.formatter = percentFormatter
        searchResultColMarketValuePercent.horizontalAlign = XcTable.TextAlign.Right
        searchResultColMarketValuePercent.footerHorizontalAlign = XcTable.TextAlign.Right
        return [
            searchResultColInstrumentCode, searchResultColInstrumentName, searchResultColSellableQuantity, searchResultColTotalQuantity, searchResultColClosingPrice, searchResultColMarketValue, searchResultColMarketValuePercent
        ]
    }
}


export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <OrderEnquiryForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);