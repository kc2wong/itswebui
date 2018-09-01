// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Toolbar } from 'app/component/common/Toolbar';
import { BASE_CURRENCY, PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency, Exchange, Instrument } from 'app/model/staticdata'
import { SecurityPositionSummary, TradingAccountPortfolio, TradingAccountPortfolioBundle } from 'app/model/client';
import { ApplicationContext, type AccountContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { tradingAccountService } from 'app/service';

import { XaPieChart, XcButton, XcButtonGroup, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow, XcInputText } from 'shared/component';
import { XcOption, XcPagination, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Language, Pageable, PageResult, SortDirection } from 'shared/model';
import { MessageService } from 'shared/service'
import { createNumberFormat, formatNumber, xlate } from 'shared/util/lang'
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
    sortBy: string,
    sortDirection: SortDirection,
    securityPositionSummary: Array<Object>,
    currencyList: Array<Currency>,
    instrumentList: Array<Instrument>
}

const formName = "portfolioEnquiryForm"

const PAGE_SIZE_OPT = _.sortBy(PAGE_SIZE_OPTION)

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
        const language = sessionContext.languageContext.language

        const { chartColors, chartFocusData, currencyList, exchangeCode, instrumentList, securityPositionSummary, sortBy, sortDirection } = this.state;
        const instrumentMap = _.keyBy(_.filter(instrumentList, e => e.exchangeCode == exchangeCode), 'instrumentCode')
        const currencyMap = _.keyBy(currencyList, 'currencyCode')
        const exchange = _.find(exchanges, e => e.exchangeCode == exchangeCode)
        const exchangeCurrency = currencyMap[exchange.baseCurrencyCode]
        const baseCurrency = currencyMap[BASE_CURRENCY]
        const data = _.filter(securityPositionSummary, e => e.exchangeCode == exchangeCode)
        const chartData = _.map(data, (d, idx) => new XaPieChart.Data(d.instrumentCode, d.marketValueBaseCurrency, null, chartColors.get(`${d.exchangeCode}.${d.instrumentCode}`)))
        const highlightedIndex = chartFocusData != null ? _.findIndex(data, d => d.instrumentCode == chartFocusData.key) : -1

        const instrumentCurrencies = new Set(_.map(data, e => e.currencyCode))
        const singleCurrency = _.size(instrumentCurrencies) == 1 && instrumentCurrencies.has(exchange.baseCurrencyCode)
        const totalMarketValue =  singleCurrency ? _.sumBy(data, "marketValue") : _.sumBy(data, "marketValueBaseCurrency")
        const marketValueCurrency = singleCurrency ? exchangeCurrency : baseCurrency

        const dpOpt = _.map(_.range(4), (i) => {
            return new XcOption(`${i}`, `${i}`)
        });

        const colorStripeProvider = (model: Object, rowNum: number): string => {
            const rtn = chartColors.get(`${model["exchangeCode"]}.${model["instrumentCode"]}`)
            return rtn != null ? rtn : ""
        }
        const numberFormat = createNumberFormat(true, exchangeCurrency != null ? exchangeCurrency.decimalPoint : 2)
        const searchResultColSpec = this.createResultColSpec(language, exchange, currencyMap, sortBy, sortDirection)
        const summary = {
            [searchResultColSpec[_.size(searchResultColSpec) - 2].name]: xlate(`${formName}.totalMarketValue`),
            [searchResultColSpec[_.size(searchResultColSpec) - 1].name]: marketValueCurrency != null ? `${marketValueCurrency.getDescription(language)}  ${formatNumber(totalMarketValue, numberFormat)}` : formatNumber(totalMarketValue, numberFormat)
        }

        return (
            <div style={{ height: "100vh" }}>
                <br />
                <XcGrid evenly>
                    <XcGrid.Row>
                        <XcGrid.Col>
                            <XcForm name={formName}>
                                <XcSelect inline name="exchange" onChange={this.handleSelectExchange} options={exchangeOpt} value={exchangeCode} />
                            </XcForm>
                        </XcGrid.Col>
                        <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Right}>
                            <XcButton icon={{ name: "refresh" }} label="#general.refresh" onClick={this.search} primary />
                        </XcGrid.Col>
                    </XcGrid.Row>
                </XcGrid>
                <br />
                <XcPanel>
                    <XcPanel.Body>
                        <XcGrid>
                            <XcGrid.Row verticalAlign={XcGrid.VerticalAlign.Top}>
                                <XcGrid.Col horizontalAlign={XcGrid.HorizontalAlign.Center} width={4}>
                                    {_.size(chartData) > 0 && (
                                        <XaPieChart data={chartData} onMouseOut={this.handlePieMouseOut} onMouseOver={this.handlePieMouseOver} />
                                    )}
                                </XcGrid.Col>
                                <XcGrid.Col width={12}>
                                    <XcTable colorStripeProvider={colorStripeProvider} colspec={searchResultColSpec}
                                        data={data}
                                        highlightedIndex={highlightedIndex}
                                        onSort={this.handleSort}
                                        onSelectionChange={this.handleSelectionChange}
                                        size={XcTable.Size.Small} summary={summary} />
                                </XcGrid.Col>
                            </XcGrid.Row>
                        </XcGrid>
                    </XcPanel.Body>
                </XcPanel>
            </div>
        )
    }

    handleClearForm = (event: SyntheticMouseEvent<>) => {
        // this.setState(this.resetState(), () => {
        //     this.props.onClear()
        // })
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

    handleSelectionChange = (index: number) => {
        // const { onRecordSelect, searchResult } = this.props
        // if (searchResult != null) {
        //     onRecordSelect(searchResult.data[index])
        // }
    }

    handleUpdatePageNum = (pageNum: number) => {
        // const { pageSize } = this.state
        // this.search(pageNum, pageSize)
    }
    
    handleUpdatePageSize = (pageSize: number) => (event: SyntheticMouseEvent<>) => {
        // const { pageNum } = this.state
        // this.search(pageNum, pageSize)
    }

    handleSelectExchange = (event: SyntheticEvent<>, target: any) => {
        event.preventDefault()
        this.setState({ exchangeCode: target.value })
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
                        const language = sessionContext.languageContext.language
                        const instrumentMap = new Object()
                        _.forEach(exchanges, e => instrumentMap[e.exchangeCode] = _.keyBy(_.filter(result.instruments, i => e.exchangeCode == i.exchangeCode), 'instrumentCode'))
                        const data = _.map(result.tradingAccountPortfolio.securityPositionSummary, 
                            e => Object.assign({instrumentName: instrumentMap[e.exchangeCode][e.instrumentCode].getDescription(sessionContext.languageContext.language)}, e))    
                        let securityPositionSummary = _.sortBy(data, [sortBy])
                        if (sortDirection == SortDirection.Descending) {
                            securityPositionSummary = _.reverse(securityPositionSummary)
                        }
                        const colors = randomColor({
                            count: _.size(securityPositionSummary),
                            hue: 'blue'
                        })
                        const colorMap = new Map()
                        _.forEach(securityPositionSummary, (s, idx) => {colorMap.set(`${s.exchangeCode}.${s.instrumentCode}`, colors[idx])})
                        this.setState({ chartColors: colorMap, currencyList: result.currencies, instrumentList: result.instruments, securityPositionSummary: securityPositionSummary }, () => {
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
            currencyList: [],
            instrumentList: []
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
        
    createResultColSpec = (language: Language, exchange: Exchange, currencyMap: Map<String, Currency>, sortBy: string, sortDirection: SortDirection): XcTableColSpec[] => {
        const baseCurrency = currencyMap[exchange["baseCurrencyCode"]]
        const quantityFormatter = (model: Object, fieldName: string) => {
            return formatNumber(model[fieldName], createNumberFormat(true, 0))
        }
        const priceFormatter = (model: Object, fieldName: string) => {
            const currency = currencyMap[model["currencyCode"]]
            return currency == baseCurrency ? `${formatNumber(model[fieldName], createNumberFormat(true, currency.decimalPoint))}` :
                currency != null ? `${currency.getDescription(language)}  ${formatNumber(model[fieldName], createNumberFormat(true, currency.decimalPoint))}` : model[fieldName]
        }
        const contentProvider = (model: Object, fieldName: string) => {
            return this.portfolioActionSheet(model)
        }
        const resultColName = ["instrumentCode", "instrumentName", "sellableQuantity", "totalQuantity", "closingPrice", "marketValue"]
        const searchResultColInstrumentCode = new XcTableColSpec(resultColName[0], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[0]}`), 2, sortBy == resultColName[0] ? sortDirection : null)
        searchResultColInstrumentCode.actionSheetProvider = contentProvider
        const searchResultColInstrumentName = new XcTableColSpec(resultColName[1], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[1]}`), 3, sortBy == resultColName[1] ? sortDirection : null)
        const searchResultColSellableQuantity = new XcTableColSpec(resultColName[2], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[2]}`), 3, sortBy == resultColName[2] ? sortDirection : null)
        searchResultColSellableQuantity.formatter = quantityFormatter
        searchResultColSellableQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColTotalQuantity = new XcTableColSpec(resultColName[3], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[3]}`), 3, sortBy == resultColName[3] ? sortDirection : null)
        searchResultColTotalQuantity.formatter = quantityFormatter
        searchResultColTotalQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColClosingPrice = new XcTableColSpec(resultColName[4], DataType.Number, `${xlate(`portfolioEnquiryForm.${resultColName[4]}`)}${baseCurrency != null ? ` (${baseCurrency.getDescription(language)})` : ""}`, 2, sortBy == resultColName[4] ? sortDirection : null)
        searchResultColClosingPrice.formatter = priceFormatter
        searchResultColClosingPrice.horizontalAlign = XcTable.TextAlign.Right
        searchResultColClosingPrice.footerHorizontalAlign = XcTable.TextAlign.Right
        const searchResultColMarketValue = new XcTableColSpec(resultColName[5], DataType.Number, `${xlate(`portfolioEnquiryForm.${resultColName[5]}`)}${baseCurrency != null ? ` (${baseCurrency.getDescription(language)})` : ""}`, 3, sortBy == resultColName[5] ? sortDirection : null)
        searchResultColMarketValue.formatter = priceFormatter
        searchResultColMarketValue.horizontalAlign = XcTable.TextAlign.Right
        searchResultColMarketValue.footerHorizontalAlign = XcTable.TextAlign.Right
        return [
            searchResultColInstrumentCode, searchResultColInstrumentName, searchResultColSellableQuantity, searchResultColTotalQuantity, searchResultColClosingPrice, searchResultColMarketValue
        ]
    }

    handlePieMouseOver = (event: SyntheticEvent<>, data: Array<any>, dataIndex: number) => {
        this.setState({ chartFocusData: data[dataIndex] })
    }

    handlePieMouseOut = (event: SyntheticEvent<>, data: Array<any>, dataIndex: number) => {
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