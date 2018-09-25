// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { Toolbar } from 'app/component/common/Toolbar';
import { PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency } from 'app/model/staticdata';
import { orderService, simpleOrderService, tradingAccountService } from 'app/service';

import { XaInputDate, XcButton, XcButtonGroup, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow } from 'shared/component';
import { XcOption, XcPagination, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Pageable, PageResult, SortDirection } from 'shared/model';
import { xlate } from 'shared/util/lang';
import { currentDate, formatDate, formatDateTime, minDate } from 'shared/util/dateUtil'

type Props = {
    onClear: () => void,
    onSearch: (searchCriteria: Object, pageable: Pageable, reverseOnly: ?bool) => ?Promise<PageResult<Currency>>,
    onRecordSelect: (currency: Currency) => void,
    selectedIndex: ?number,
    searchResult: ?PageResult<Currency>
}

type IntProps = {
    exchanges: Exchange[],
    messageService: MessageService,
    sessionContext: SessionContextType,
    onClear: () => void,
    onSearch: (searchCriteria: Object, pageable: Pageable, reverseOnly: ?bool) => ?Promise<PageResult<Currency>>,
    onRecordSelect: (currency: Currency) => void,
    selectedIndex: ?number,
    searchResult: ?PageResult<Currency>
}

type State = {
    pageNum: number,
    pageSize: number,
    searchCriteria: Object,
    searchResultColSpec: XcTableColSpec[],
    sortBy: string,
    sortDirection: SortDirection
}

class SearchCriteria implements BaseModel {
    data: Object;

    constructor() {
        this.data = {};
    }

    toJson(): Object {
        return this.data;
    }
}

const formName = "orderHistoryEnquiryForm"

const PAGE_SIZE_OPT = _.sortBy(PAGE_SIZE_OPTION)

export class OrderHistoryEnquiryForm extends Component<IntProps, State> {

    constructor(props: Props) {
        super(props);
        this.state = this.resetState();
    }

    render() {
        const { exchanges, sessionContext } = this.props
        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const { selectedIndex, searchResult } = this.props;
        const { pageNum, pageSize, searchResultColSpec } = this.state;
        const numOfRecord = searchResult != null ? searchResult.totalCount : 0;

        const criteriaFromDate = new XcSearchCriteriaSpec(`#${formName}.fromDate`, "fromDate", 3);
        const criteriaToDate = new XcSearchCriteriaSpec(`#${formName}.toDate`, "toDate", 3);
        const searchCriteria = [[criteriaFromDate, criteriaToDate]];

        return (
            <div style={{ height: "100vh" }}>
                <XcForm model={this.state.searchCriteria} name={formName} onSubmit={this.handleSearch} >
                    {_.map(searchCriteria, (row, rowIdx) => (
                        <XcFormGroup equalsWidth={false} key={rowIdx}>
                            <XcSelect name="exchangeCode" model={searchCriteria} options={exchangeOpt} />
                            {_.map(row, (col, colIdx) => (
                                <XaInputDate key={colIdx} label={col.label} name={col.name} width={col.width} />
                            ))}
                        </XcFormGroup>
                    ))}
                    <XcButtonGroup>
                        <XcButton label="#general.search" onClick={this.search} primary />
                        <XcButton label="#general.clear" onClick={this.handleClearForm} />
                    </XcButtonGroup>
                    {searchResult != null && (
                        <XcPanel>
                            <XcPanel.Header>{xlate("general.searchResult")}</XcPanel.Header>
                            <XcPanel.Body>
                                <XcTable colspec={searchResultColSpec}
                                    data={searchResult.data}
                                    onSort={this.handleSort}
                                    onSelectionChange={this.handleSelectionChange}
                                    selectedIndex={selectedIndex}
                                    size={XcTable.Size.Small} />
                            </XcPanel.Body>
                            <XcPanel.Footer>
                                <XcGrid>
                                    <XcGrid.Row>
                                        <XcGrid.Col width={8}>
                                            <XcPagination activePage={pageNum} freeNavigate={searchResult.totalCount >= 0} onPageChange={this.handleUpdatePageNum} totalPages={searchResult.totalPage} />
                                        </XcGrid.Col>
                                        <XcGrid.Col alignRight={true} width={4}>
                                            {xlate("general.pageSize")}&emsp;
                                        <XcPagination activePage={pageSize} onPageChange={this.handleUpdatePageSize} range={PAGE_SIZE_OPT} />
                                        </XcGrid.Col>
                                        {numOfRecord >= 0 && (
                                            <XcGrid.Col alignRight={true} width={3}>
                                                {xlate("general.noOfMatchRecord", [numOfRecord.toString()])}
                                            </XcGrid.Col>
                                        )}
                                    </XcGrid.Row>
                                </XcGrid>
                            </XcPanel.Footer>
                        </XcPanel>
                    )}
                </XcForm>
            </div>
        )
    }

    handleClearForm = (event: SyntheticMouseEvent<>) => {
        this.setState(this.resetState(), () => {
            this.props.onClear()
        })
    }

    handleSearch = (event: SyntheticMouseEvent<>) => {
        const { pageNum, pageSize } = this.state
        this.search(pageNum, pageSize)
    }

    handleSort = (sortBy: string, sortDirection : SortDirection) => {
        const { pageNum, pageSize } = this.state
        const currentSortBy = this.state.sortBy
        const currentSortDirection = this.state.sortDirection
        const pageable = new Pageable(pageNum, pageSize, sortBy, sortDirection)
        const reverseOnly = sortBy == currentSortBy && sortDirection != currentSortDirection

        const promise = this.props.onSearch(this.state.searchCriteria.toJson(), pageable, reverseOnly)
        if (promise) {
            promise.then(
                result => {
                    const searchResultColSpec = this.createResultColSpec(sortBy, sortDirection)
                    this.setState({ pageNum: result.currentPage, pageSize: result.pageSize, searchResultColSpec: searchResultColSpec, sortBy: sortBy, sortDirection: sortDirection })
                },
                error => {
                    // TODO                
                }
            )
        }
    }

    handleSelectionChange = (index: number) => {
        const { onRecordSelect, searchResult } = this.props
        if (searchResult != null) {
            onRecordSelect(searchResult.data[index])
        }
    }

    handleUpdatePageNum = (pageNum: number) => {
        const { pageSize } = this.state
        this.search(pageNum, pageSize)
    }
    
    handleUpdatePageSize = (pageSize: number) => (event: SyntheticMouseEvent<>) => {
        const { pageNum } = this.state
        this.search(pageNum, pageSize)
    }

    search = (pageNum: number, pageSize: number) => {
        const { exchanges, messageService, sessionContext } = this.props
        const { searchCriteria, sortBy, sortDirection } = this.state
        const exchangeCode = searchCriteria.exchangeCode
        const pageable = new Pageable(pageNum, pageSize, sortBy, sortDirection)
        const selectedTradingAccount = sessionContext.accountContext.gelectTradingAccount()
        if (selectedTradingAccount) {
            messageService.showLoading()
            const exchange = _.find(exchanges, e => e.exchangeCode == exchangeCode)
            const startTradeDate = exchange != null ? minDate(currentDate(), exchange.tradeDate) : currentDate()
            const promise = simpleOrderService.enquireOrder(selectedTradingAccount.tradingAccountCode, exchangeCode, startTradeDate, null)
            if (promise) {
                promise.then(
                    orderEnquirySearchResult => {
                        let orders = orderEnquirySearchResult.simpleOrders
                        const instruments = orderEnquirySearchResult.instruments
                        const orderInstrumentIndex = orderEnquirySearchResult.orderInstrumentIndex
                        const instrumentMap = new Map()
                        orderInstrumentIndex.forEach((value, key) => instrumentMap.set(key, instruments[value]))
                        if (sortDirection == SortDirection.Descending) {
                            orders = _.reverse(orders)
                        }
                        this.setState({ instrumentMap: instrumentMap, lastUpdate: new Date(), orders: orders }, () => {
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
            pageNum: 1,
            pageSize: PAGE_SIZE_OPTION[0],
            searchCriteria: {exchangeCode: "HKG"},
            searchResultColSpec: searchResultColSpec,
            sortBy: searchResultColSpec[0].name,
            sortDirection: searchResultColSpec[0].sortDirection
        }
    }

    createResultColSpec = (sortBy: string, sortDirection: SortDirection): XcTableColSpec[] => {
        const resultColName = ["currencyCode", "descptDefLang", "descpt2ndLang", "descpt3rdLang"]
        const searchResultColCode = new XcTableColSpec(resultColName[0], DataType.String, xlate(`currencyEditForm.${resultColName[0]}`), 3, sortBy == resultColName[0] ? sortDirection : null)
        const searchResultColDescptDefLang = new XcTableColSpec(resultColName[1], DataType.String, xlate(`currencyEditForm.${resultColName[1]}`), 5, sortBy == resultColName[1] ? sortDirection : null)
        const searchResultColDescpt2ndLang = new XcTableColSpec(resultColName[2], DataType.String, xlate(`currencyEditForm.${resultColName[2]}`), 4, sortBy == resultColName[2] ? sortDirection : null)
        const searchResultColDescpt3rdLang = new XcTableColSpec(resultColName[3], DataType.String, xlate(`currencyEditForm.${resultColName[3]}`), 4, sortBy == resultColName[3] ? sortDirection : null)
        return [
            searchResultColCode, searchResultColDescptDefLang, searchResultColDescpt2ndLang, searchResultColDescpt3rdLang
        ]
    }
}

export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <OrderHistoryEnquiryForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);