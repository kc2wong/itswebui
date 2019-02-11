// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Toolbar } from 'app/component/common/Toolbar';
import { BASE_CURRENCY, PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency, Exchange, Instrument } from 'app/model/staticdata'
import { SecurityPositionSummary, TradingAccountPortfolio, TradingAccountPortfolioBundle } from 'app/model/client';
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { tradingAccountService } from 'app/service';

import { XaPieChart, XcButton, XcButtonGroup, XcContextMenu, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow, XcInputText } from 'shared/component';
import { XcOption, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Language, Pageable, PageResult, SortDirection } from 'shared/model';
import { MessageService } from 'shared/service'
import { createNumberFormat, formatNumber, roundNumber, xlate } from 'shared/util/lang'
import { formatDateTime } from 'shared/util/dateUtil'
import { Header, Button, Popup, Grid } from 'semantic-ui-react'

import randomColor from 'randomcolor'

type Props = {
    exchanges: Exchange[]
}

type IntProps = {
    exchanges: Exchange[],
    messageService: MessageService,
    sessionContext: SessionContextType
}

type State = {
    chartColors: Map<string, string>,
    chartFocusData: ?Object,
    exchangeCode: string,
    lastUpdate: ?Date,
    sortBy: string,
    sortDirection: SortDirection,
    securityPositionSummary: Array<Object>,
    instrumentMap: Map<string, Array<Instrument>>
}

const formName = "portfolioEnquiryForm"

class PortfolioEnquiryForm extends Component<IntProps, State> {

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

        const { chartColors, chartFocusData, exchangeCode, instrumentMap, lastUpdate, securityPositionSummary, sortBy, sortDirection } = this.state;
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

        const chartData = _.map(data, (d, idx) => new XaPieChart.Data(d.instrumentCode, d.marketValueBaseCurrency, null, chartColors.get(`${d.exchangeCode}.${d.instrumentCode}`)))
        const highlightedIndex = chartFocusData != null ? _.findIndex(data, d => d.instrumentCode == chartFocusData.key) : -1

        const instrumentCurrencies = new Set(_.map(data, e => e.currencyCode))
        const singleCurrency = _.size(instrumentCurrencies) == 1 && instrumentCurrencies.has(exchange.baseCurrencyCode)
        const totalMarketValue =  singleCurrency ? _.sumBy(data, "marketValue") : totalMarketValueBaseCcy
        const marketValueCurrency = singleCurrency ? exchangeCurrency : baseCurrency

        const colorStripeProvider = (model: Object, rowNum: number): string => {
            const rtn = chartColors.get(`${model["exchangeCode"]}.${model["instrumentCode"]}`)
            return rtn != null ? rtn : ""
        }
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
                <XcGrid>
                    <XcGrid.Row>
                        <XcGrid.Col width={8}>
                            <XcSelect inline label={`#${formName}.exchange`} onChange={this.handleSelectExchange} options={exchangeOpt} value={exchangeCode} />
                        </XcGrid.Col>
                        <XcGrid.Col width={8} horizontalAlign={XcGrid.HorizontalAlign.Right}>
                            <div>{lastUpdate != null ? xlate("general.lastUpdate", [formatDateTime(lastUpdate)]) : ""}&nbsp;&nbsp;<XcButton icon={{ name: "refresh" }} label="#general.refresh" onClick={this.search} primary /></div>
                        </XcGrid.Col>
                    </XcGrid.Row>
                </XcGrid>                
                <br />
                <XcPanel>
                    <XcPanel.Body>
                        <XcGrid>
                            <XcGrid.Row verticalAlign={XcGrid.VerticalAlign.Top}>
                                <XcGrid.Col width={4}>
                                    {_.size(chartData) > 0 && (
                                        <React.Fragment>
                                            <div>{xlate(`${formName}.portfolioDistribution`)}</div>
                                            <br/>
                                            <XaPieChart data={chartData} onMouseOut={this.handlePieMouseOut} onMouseOver={this.handlePieMouseOver} />
                                        </React.Fragment>
                                    )}
                                    {_.size(chartData) == 0 && (
                                        <div>{xlate(`${formName}.noHolding`)}</div>
                                    )}
                                </XcGrid.Col>
                                <XcGrid.Col width={12}>
                                    <XcTable colorStripeProvider={colorStripeProvider} colspec={searchResultColSpec}
                                        data={data}
                                        highlightedIndex={highlightedIndex}
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
        const { sessionContext } = this.props
        const currentSortBy = this.state.sortBy
        const currentSortDirection = this.state.sortDirection
        const { securityPositionSummary, instrumentMap } = this.state
 
        if (currentSortBy == sortBy) {
            // reverse only
            this.setState({ sortDirection: sortDirection, securityPositionSummary: _.reverse(securityPositionSummary) })
        }
        else {
            const language = sessionContext.languageContext.language

            // Sort by marketValuePercent should be same as marketValueBaseCurrency, so no need to calculate percentage
            let data = _.sortBy(_.map(securityPositionSummary, 
                e => Object.assign({instrumentName: instrumentMap[e.exchangeCode][e.instrumentCode].getDescription(language), 
                    marketValuePercent: e.marketValueBaseCurrency }, e)), [sortBy])
    
            if (sortDirection == SortDirection.Descending) {
                data = _.reverse(data)
            }            
            this.setState({ sortBy: sortBy, sortDirection: sortDirection, securityPositionSummary: _.map(data, d => _.find(securityPositionSummary, o => o.instrumentCode == d.instrumentCode)) })
        }
    }

     
    handleSelectExchange = (event: SyntheticEvent<>, target: any) => {
        event.preventDefault()
        this.setState({ exchangeCode: target.value })
    }

    search = () => {
        const { exchanges, messageService, sessionContext } = this.props
        const { exchangeCode, sortBy, sortDirection } = this.state
        const selectedTradingAccount = sessionContext.accountContext.selectedTradingAccount()
        if (selectedTradingAccount) {
            messageService.showLoading()
            const promise = tradingAccountService.getAccountPortfolio(selectedTradingAccount.tradingAccountCode, BASE_CURRENCY)
            if (promise) {
                promise.then(
                    result => {
                        const instrumentMap = new Map()
                        _.forEach(exchanges, e => instrumentMap[e.exchangeCode] = _.keyBy(_.filter(result.instruments, i => e.exchangeCode == i.exchangeCode), 'instrumentCode'))
                        let securityPositionSummary = _.sortBy(result.accountPortfolio.securityPositionSummary, [sortBy])
                        if (sortDirection == SortDirection.Descending) {
                            securityPositionSummary = _.reverse(securityPositionSummary)
                        }
                        const colors = randomColor({
                            count: _.size(securityPositionSummary),
                            hue: 'blue'
                        })
                        
                        const colorMap = new Map()
                        _.forEach(securityPositionSummary, (s, idx) => {colorMap.set(`${s.exchangeCode}.${s.instrumentCode}`, colors[idx])})
                        this.setState({ chartColors: colorMap, instrumentMap: instrumentMap, lastUpdate: new Date(), securityPositionSummary: securityPositionSummary }, () => {
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
            chartColors: new Map(),
            chartFocusData: null,
            exchangeCode: this.props.exchanges[0].exchangeCode,
            sortBy: "instrumentCode",
            sortDirection: SortDirection.Ascending,
            securityPositionSummary: [],
            instrumentMap: new Map()
        }
    }

    portfolioActionSheet = (model: Object) => (
        <XcContextMenu>
            <XcContextMenu.Item title={xlate(`${formName}.topUpTitle`)} description={xlate(`${formName}.topUpHint`)} buttonLabel={xlate(`${formName}.topUpTitle`)} buttonAction={() =>{console.log('hihi')} }/>
            <XcContextMenu.Item title={xlate(`${formName}.sellOutTitle`)} description={xlate(`${formName}.sellOutHint`)} buttonLabel={xlate(`${formName}.sellOutTitle`)} buttonAction={() =>{} }/>
            <XcContextMenu.Item title={xlate(`${formName}.quoteTitle`)} description={xlate(`${formName}.quoteHint`)} buttonLabel={xlate(`${formName}.quoteButton`)} buttonAction={() =>{} }/>
        </XcContextMenu>
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
        const searchResultColInstrumentCode = new XcTableColSpec(resultColName[0], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[0]}`), 2, true, sortBy == resultColName[0] ? sortDirection : null)
        searchResultColInstrumentCode.actionSheetProvider = contentProvider
        const searchResultColInstrumentName = new XcTableColSpec(resultColName[1], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[1]}`), 3, true, sortBy == resultColName[1] ? sortDirection : null)
        const searchResultColSellableQuantity = new XcTableColSpec(resultColName[2], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[2]}`), 2, true, sortBy == resultColName[2] ? sortDirection : null)
        searchResultColSellableQuantity.formatter = quantityFormatter
        searchResultColSellableQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColTotalQuantity = new XcTableColSpec(resultColName[3], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[3]}`), 2, true, sortBy == resultColName[3] ? sortDirection : null)
        searchResultColTotalQuantity.formatter = quantityFormatter
        searchResultColTotalQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColClosingPrice = new XcTableColSpec(resultColName[4], DataType.Number, `${xlate(`portfolioEnquiryForm.${resultColName[4]}`)}${exchangeCurrency != null ? ` (${exchangeCurrency.getDescription(language)})` : ""}`, 2, true, sortBy == resultColName[4] ? sortDirection : null)
        searchResultColClosingPrice.formatter = priceFormatter
        searchResultColClosingPrice.horizontalAlign = XcTable.TextAlign.Right
        searchResultColClosingPrice.footerHorizontalAlign = XcTable.TextAlign.Right
        const searchResultColMarketValue = new XcTableColSpec(resultColName[5], DataType.Number, `${xlate(`portfolioEnquiryForm.${resultColName[5]}`)}${exchangeCurrency != null ? ` (${exchangeCurrency.getDescription(language)})` : ""}`, 3, true, sortBy == resultColName[5] ? sortDirection : null)
        searchResultColMarketValue.formatter = priceFormatter
        searchResultColMarketValue.horizontalAlign = XcTable.TextAlign.Right
        searchResultColMarketValue.footerHorizontalAlign = XcTable.TextAlign.Right
        const searchResultColMarketValuePercent = new XcTableColSpec(resultColName[6], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[6]}`), 2, true, sortBy == resultColName[6] ? sortDirection : null)
        searchResultColMarketValuePercent.formatter = percentFormatter
        searchResultColMarketValuePercent.horizontalAlign = XcTable.TextAlign.Right
        searchResultColMarketValuePercent.footerHorizontalAlign = XcTable.TextAlign.Right
        return [
            searchResultColInstrumentCode, searchResultColInstrumentName, searchResultColSellableQuantity, searchResultColTotalQuantity, searchResultColClosingPrice, searchResultColMarketValue, searchResultColMarketValuePercent
        ]
    }

    handlePieMouseOver = (event: SyntheticEvent<>, data: any) => {
        this.setState({ chartFocusData: data })
    }

    handlePieMouseOut = (event: SyntheticEvent<>, data: any) => {
        this.setState({ chartFocusData: null })
    }

}


export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <PortfolioEnquiryForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);