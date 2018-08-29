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
import { BaseModel, DataType, Pageable, PageResult, SortDirection } from 'shared/model';
import { MessageService } from 'shared/service'
import { xlate } from 'shared/util/lang'

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
    searchResultColSpec: XcTableColSpec[],
    sortBy: string,
    sortDirection: SortDirection,
    securityPositionSummary: Array<SecurityPositionSummary>,
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

        const { exchangeCode, instrumentList, searchResultColSpec, securityPositionSummary } = this.state;
        const instrumentMap = _.keyBy(_.filter(instrumentList, e => e.exchangeCode == exchangeCode), 'instrumentCode')
        console.log(instrumentMap)
        const data = _.map(_.filter(securityPositionSummary, e => e.exchangeCode == exchangeCode), e => Object.assign({instrumentName: instrumentMap[e.instrumentCode].getDescription(sessionContext.languageContext.language)}, e))
        const totalMarketValue = _.sumBy(data, "marketValueBaseCurrency")

        const dpOpt = _.map(_.range(4), (i) => {
            return new XcOption(`${i}`, `${i}`)
        });

        const criteriaCode = new XcSearchCriteriaSpec("#currencyEditForm.currencyCode", "currencyCode", 3);
        const criteriaDescptDefLang = new XcSearchCriteriaSpec("#currencyEditForm.descptDefLang", "descptDefLang", 9);
        const searchCriteria = [[criteriaCode, criteriaDescptDefLang]];
        const summary = {
            [searchResultColSpec[_.size(searchResultColSpec) - 2].name]: xlate("portfolioEnquiryForm.totalMarketValue"),
            [searchResultColSpec[_.size(searchResultColSpec) - 1].name]: totalMarketValue
        }

        return (
            <div style={{ height: "100vh" }}>
                <br />
                <XcGrid>
                    <XcGrid.Row>
                        <XcGrid.Col width={8}>
                            <XcSelect label="#portfolioEnquiryForm.exchange" name="exchangeCode" options={exchangeOpt} validation={{ required: true }} value={exchangeCode} />
                        </XcGrid.Col>
                        <XcGrid.Col alignRight={true} width={8}>
                            <XcButton icon={{ name: "refresh" }} label="#general.refresh" primary />
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
        // const currentSortBy = this.state.sortBy
        // const currentSortDirection = this.state.sortDirection
        // const pageable = new Pageable(pageNum, pageSize, sortBy, sortDirection)
        // const reverseOnly = sortBy == currentSortBy && sortDirection != currentSortDirection

        // const promise = this.props.onSearch(this.state.searchCriteria.toJson(), pageable, reverseOnly)
        // if (promise) {
        //     promise.then(
        //         result => {
        //             const searchResultColSpec = this.createResultColSpec(sortBy, sortDirection)
        //             this.setState({ pageNum: result.currentPage, pageSize: result.pageSize, searchResultColSpec: searchResultColSpec, sortBy: sortBy, sortDirection: sortDirection })
        //         },
        //         error => {
        //             // TODO                
        //         }
        //     )
        // }
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

    search = () => {
        const { messageService, sessionContext } = this.props
        const { sortBy, sortDirection } = this.state
        const selectedTradingAccount = sessionContext.accountContext.gelectTradingAccount()
        if (selectedTradingAccount) {
            messageService.showLoading()
            const promise = tradingAccountService.getAccountPortfolio(selectedTradingAccount.tradingAccountCode, BASE_CURRENCY)
            if (promise) {
                promise.then(
                    result => {
                        this.setState({ instrumentList: result.instruments, securityPositionSummary: result.tradingAccountPortfolio.securityPositionSummary }, () => {
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
        const searchResultColSpec = this.createResultColSpec("currencyCode", SortDirection.Ascending)
        return {
            exchangeCode: this.props.exchanges[0].exchangeCode,
            pageNum: 1,
            pageSize: PAGE_SIZE_OPTION[0],
            // searchCriteria: new SearchCriteria(),
            searchResultColSpec: searchResultColSpec,
            sortBy: searchResultColSpec[0].name,
            sortDirection: searchResultColSpec[0].sortDirection,
            securityPositionSummary: []
        }
    }

    createResultColSpec = (sortBy: string, sortDirection: SortDirection): XcTableColSpec[] => {
        const resultColName = ["instrumentCode", "instrumentName", "sellableQuantity", "totalQuantity", "closingPrice", "marketValue"]
        const searchResultColInstrumentCode = new XcTableColSpec(resultColName[0], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[0]}`), 2, null, null, sortBy == resultColName[0] ? sortDirection : null)
        const searchResultColInstrumentName = new XcTableColSpec(resultColName[1], DataType.String, xlate(`portfolioEnquiryForm.${resultColName[1]}`), 3, null, null, sortBy == resultColName[1] ? sortDirection : null)
        const searchResultColSellableQuantity = new XcTableColSpec(resultColName[2], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[2]}`), 3, null, null, sortBy == resultColName[2] ? sortDirection : null)
        const searchResultColTotalQuantity = new XcTableColSpec(resultColName[3], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[3]}`), 3, null, null, sortBy == resultColName[3] ? sortDirection : null)
        const searchResultColClosingPrice = new XcTableColSpec(resultColName[4], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[4]}`), 2, null, XcTable.TextAlign.Right, sortBy == resultColName[4] ? sortDirection : null)
        const searchResultColMarketValue = new XcTableColSpec(resultColName[5], DataType.Number, xlate(`portfolioEnquiryForm.${resultColName[5]}`), 3, null, null, sortBy == resultColName[5] ? sortDirection : null)
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