// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Toolbar } from 'app/component/common/Toolbar';
import { BASE_CURRENCY, PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency, Exchange, Instrument } from 'app/model/staticdata'
import { SecurityPositionSummary, TradingAccountPortfolio, TradingAccountPortfolioBundle } from 'app/model/client';
import { ApplicationContext, type AccountContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { tradingAccountService } from 'app/service';

import { XcButton, XcButtonGroup, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow, XcInputText } from 'shared/component';
import { XcOption, XcPagination, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Language, Pageable, PageResult, SortDirection } from 'shared/model';
import { MessageService } from 'shared/service'
import { createNumberFormat, formatNumber, xlate } from 'shared/util/lang'

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
    // searchResultColSpec: XcTableColSpec[],
    sortBy: string,
    sortDirection: SortDirection,
    securityPositionSummary: Array<Object>,
    currencyList: Array<Currency>,
    instrumentList: Array<Instrument>
}

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
        // const { selectedIndex, searchResult } = this.props;
        const { exchanges, sessionContext } = this.props
        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const language = sessionContext.languageContext.language

        const { currencyList, exchangeCode, instrumentList, securityPositionSummary, sortBy, sortDirection } = this.state;
        const instrumentMap = _.keyBy(_.filter(instrumentList, e => e.exchangeCode == exchangeCode), 'instrumentCode')
        const currencyMap = _.keyBy(currencyList, 'currencyCode')
        const currency = currencyMap[BASE_CURRENCY]
        const data = _.filter(securityPositionSummary, e => e.exchangeCode == exchangeCode)
        const totalMarketValue = _.sumBy(data, "marketValueBaseCurrency")

        const dpOpt = _.map(_.range(4), (i) => {
            return new XcOption(`${i}`, `${i}`)
        });

        const numberFormat = createNumberFormat(true, currency != null ? currency.decimalPoint : 2)
        const searchResultColSpec = this.createResultColSpec(language, currencyMap, sortBy, sortDirection)
        const summary = {
            [searchResultColSpec[_.size(searchResultColSpec) - 2].name]: xlate("portfolioEnquiryForm.totalMarketValue"),
            [searchResultColSpec[_.size(searchResultColSpec) - 1].name]: (currency != null ? `${currency.getDescription(language)}  ${formatNumber(totalMarketValue, numberFormat)}` : formatNumber(totalMarketValue, numberFormat))
        }

        return (
            <div style={{ height: "100vh" }}>
                <br />
                <XcGrid>
                    <XcGrid.Row>
                        <XcGrid.Col width={8}>
                            <XcSelect label="#portfolioEnquiryForm.exchange" name="exchangeCode" onChange={this.handleSelectExchange} options={exchangeOpt} validation={{ required: true }} value={exchangeCode} />
                        </XcGrid.Col>
                        <XcGrid.Col alignRight={true} width={8}>
                            <XcButton icon={{ name: "refresh" }} label="#general.refresh" onClick={this.search} primary />
                        </XcGrid.Col>
                    </XcGrid.Row>
                </XcGrid>
                <br />
                <XcPanel>
                    <XcPanel.Body>
                        <XcTable colspec={searchResultColSpec}
                            data={data}
                            onSort={this.handleSort}
                            onSelectionChange={this.handleSelectionChange}
                            size={XcTable.Size.Small} summary={summary} />
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
                        this.setState({ currencyList: result.currencies, instrumentList: result.instruments, securityPositionSummary: securityPositionSummary }, () => {
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
        // const searchResultColSpec = this.createResultColSpec("currencyCode", SortDirection.Ascending)
        return {
            exchangeCode: this.props.exchanges[0].exchangeCode,
            pageNum: 1,
            pageSize: PAGE_SIZE_OPTION[0],
            // searchCriteria: new SearchCriteria(),
            // searchResultColSpec: searchResultColSpec,
            sortBy: "instrumentCode",
            sortDirection: SortDirection.Ascending,
            securityPositionSummary: []
        }
    }

    createResultColSpec = (language: Language, currencyMap: Map<String, Currency>, sortBy: string, sortDirection: SortDirection): XcTableColSpec[] => {
        const quantityFormatter = (model: Object, fieldName: string) => {
            return formatNumber(model[fieldName], createNumberFormat(true, 0))
        }
        const priceFormatter = (model: Object, fieldName: string) => {
            const currency = currencyMap[model["currencyCode"]]
            return currency ? `${currency.getDescription(language)}  ${formatNumber(model[fieldName], createNumberFormat(true, currency.decimalPoint))}` : model[fieldName]
        }
        const resultColName = ["instrumentCode", "instrumentName", "sellableQuantity", "totalQuantity", "closingPrice", "marketValue"]
        const searchResultColInstrumentCode = new XcTableColSpec(resultColName[0], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[0]}`), 2, sortBy == resultColName[0] ? sortDirection : null)
        const searchResultColInstrumentName = new XcTableColSpec(resultColName[1], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[1]}`), 3, sortBy == resultColName[1] ? sortDirection : null)
        const searchResultColSellableQuantity = new XcTableColSpec(resultColName[2], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[2]}`), 3, sortBy == resultColName[2] ? sortDirection : null)
        searchResultColSellableQuantity.formatter = quantityFormatter
        searchResultColSellableQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColTotalQuantity = new XcTableColSpec(resultColName[3], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[3]}`), 3, sortBy == resultColName[3] ? sortDirection : null)
        searchResultColTotalQuantity.formatter = quantityFormatter
        searchResultColTotalQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColClosingPrice = new XcTableColSpec(resultColName[4], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[4]}`), 2, sortBy == resultColName[4] ? sortDirection : null)
        searchResultColClosingPrice.formatter = priceFormatter
        searchResultColClosingPrice.horizontalAlign = XcTable.TextAlign.Right
        searchResultColClosingPrice.footerHorizontalAlign = XcTable.TextAlign.Right
        const searchResultColMarketValue = new XcTableColSpec(resultColName[5], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[5]}`), 3, sortBy == resultColName[5] ? sortDirection : null)
        searchResultColMarketValue.formatter = priceFormatter
        searchResultColMarketValue.horizontalAlign = XcTable.TextAlign.Right
        searchResultColMarketValue.footerHorizontalAlign = XcTable.TextAlign.Right
        return [
            searchResultColInstrumentCode, searchResultColInstrumentName, searchResultColSellableQuantity, searchResultColTotalQuantity, searchResultColClosingPrice, searchResultColMarketValue
        ]
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