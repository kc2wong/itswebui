// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { Toolbar } from 'app/component/common/Toolbar';
import { PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency, Exchange, Instrument } from 'app/model/staticdata'
import { OrderStatus } from 'app/model/EnumType'
import { SimpleOrder } from 'app/model/order'
import { orderService, simpleOrderService, tradingAccountService } from 'app/service';

import { XaInputDate, XaPagination, XcButton, XcButtonGroup, XcContextMenu, XcDialog, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow } from 'shared/component';
import { XcNavigationTab, XcOption, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Language, Pageable, PageResult, SortDirection } from 'shared/model';
import { MessageService } from 'shared/service'
import { createNumberFormat, formatNumber, roundNumber, parseBool, xlate } from 'shared/util/lang'
import { currentDate, formatDate, formatDateTime, minDate } from 'shared/util/dateUtil'

type Props = {
    exchanges: Exchange[]
}

type IntProps = {
    exchanges: Exchange[],
    messageService: MessageService,
    sessionContext: SessionContextType
}

type State = {
    pageNum: number,
    pageSize: number,
    searchCriteria: Object,
    sortBy: string,
    sortDirection: SortDirection,
    searchResult: ?PageResult<SimpleOrder>,
    instrumentMap: Map<string, Instrument>
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
const resultColName = ["orderNumber", "buySell", "instrumentCode", "instrumentName", "price", "quantity", "executedQuantity", "orderStatus"]
const OUTSTANDING_ORDER_STATUS = new Set([OrderStatus.Pending, OrderStatus.New, OrderStatus.Reserved, OrderStatus.WaitForApprove, OrderStatus.Queued, OrderStatus.PartialExecuted])
const PAGE_SIZE_OPT = _.sortBy(PAGE_SIZE_OPTION)

export class OrderHistoryEnquiryForm extends Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);
        this.state = this.resetState();
    }

    render() {
        const { exchanges, sessionContext } = this.props
        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))

        const cacheContext = sessionContext.cacheContext
        const language = sessionContext.languageContext.language
        const navigationContext = sessionContext.navigationContext

        const { instrumentMap, pageNum, pageSize, searchCriteria, searchResult, sortBy, sortDirection } = this.state;
        const numOfRecord = searchResult != null ? searchResult.totalCount : 0;

        const exchange = _.find(exchanges, e => e.exchangeCode == searchCriteria.exchangeCode)

        const criteriaFromDate = new XcSearchCriteriaSpec(`#${formName}.fromDate`, "fromDate", 3);
        const criteriaToDate = new XcSearchCriteriaSpec(`#${formName}.toDate`, "toDate", 3);
        const dateSearchCriteria = [[criteriaFromDate, criteriaToDate]];

        const searchResultColSpec = this.createResultColSpec(cacheContext, language, exchange, instrumentMap, sortBy, sortDirection)
        const data = searchResult != null ? _.map(searchResult.data, (e) => {
            const instrument: Instrument = instrumentMap.get(e.orderNumber)
            return Object.assign({ instrumentName: instrument != null ? instrument.getDescription(language) : "" }, e,
                { orderStatus: xlate(`enum.externalOrderStatus.${e.orderStatus}`), outstandingOrder: OUTSTANDING_ORDER_STATUS.has(e.getOrderStatus()) })
        }) : []

        return (
            <div style={{ height: "100vh" }}>
                <XcForm model={searchCriteria} name={formName} onSubmit={this.handleSearch} >
                    {_.map(dateSearchCriteria, (row, rowIdx) => (
                        <XcFormGroup equalsWidth={false} key={rowIdx}>
                            <XcSelect name="exchangeCode" model={searchCriteria} options={exchangeOpt} />
                            {_.map(row, (col, colIdx) => (
                                <XaInputDate key={colIdx} label={col.label} name={col.name} width={col.width} />
                            ))}
                        </XcFormGroup>
                    ))}
                    <XcButtonGroup>
                        <XcButton label="#general.search" onClick={this.handleSearch} primary />
                        <XcButton label="#general.clear" onClick={this.handleClearForm} />
                    </XcButtonGroup>
                    {searchResult != null && (
                        <React.Fragment>
                            {_.size(data) == 0 && (
                                <React.Fragment>
                                    <br />
                                    <br />
                                    <div>{xlate("general.noMatchRecord")}</div>
                                </React.Fragment>
                            )}
                            {_.size(data) > 0 && (
                                <XcPanel>
                                    <XcPanel.Header>{xlate("general.searchResult")}</XcPanel.Header>
                                    <XcPanel.Body>
                                        <XcTable colspec={searchResultColSpec}
                                            data={data}
                                            onSort={this.handleSort}
                                            size={XcTable.Size.Small} />
                                    </XcPanel.Body>
                                    <XcPanel.Footer>
                                        <XcGrid>
                                            <XcGrid.Row>
                                                <XcGrid.Col width={8}>
                                                    <XaPagination activePage={pageNum} freeNavigate={searchResult.totalCount >= 0} hasNext={searchResult.hasNext} onPageChange={this.handleUpdatePageNum} totalPages={searchResult.totalPage} />
                                                </XcGrid.Col>
                                                <XcGrid.Col alignRight={true} width={4}>
                                                    {xlate("general.pageSize")}&emsp;
                                    <XaPagination activePage={pageSize} onPageChange={this.handleUpdatePageSize} range={PAGE_SIZE_OPT} />
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
                        </React.Fragment>
                    )}
                </XcForm>
            </div>
        )
    }

    handleClearForm = (event: SyntheticMouseEvent<>) => {
        this.setState(this.resetState())
    }

    handleSearch = (event: SyntheticMouseEvent<>) => {
        const { pageNum, pageSize } = this.state
        this.search(pageNum, pageSize)
    }

    handleSort = (sortBy: string, sortDirection : SortDirection) => {
        const { pageNum, pageSize, searchResult } = this.state
        const currentSortBy = this.state.sortBy
        const currentSortDirection = this.state.sortDirection
        const reverseOnly = sortBy == currentSortBy && sortDirection != currentSortDirection

        if (reverseOnly && searchResult != null) {
            searchResult.data = _.reverse(searchResult.data)
            this.setState({ searchResult: searchResult, sortDirection: sortDirection })
        }
        else {
            this.setState({sortBy: sortBy, sortDirection: sortDirection}, () => {
                this.search(pageNum, pageSize)
            })    
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
        const selectedTradingAccount = sessionContext.accountContext.selectedTradingAccount()
        if (selectedTradingAccount) {
            messageService.showLoading()
            const startTradeDate = searchCriteria.fromDate
            const endTradeDate = searchCriteria.toDate
            const promise = simpleOrderService.enquireOrder(selectedTradingAccount.tradingAccountCode, exchangeCode, startTradeDate, endTradeDate, pageable)
            if (promise) {
                promise.then(
                    orderEnquirySearchResult => {
                        let orders = orderEnquirySearchResult.simpleOrders.data
                        const instruments = orderEnquirySearchResult.instruments
                        const orderInstrumentIndex = orderEnquirySearchResult.orderInstrumentIndex
                        const instrumentMap = new Map()
                        orderInstrumentIndex.forEach((value, key) => instrumentMap.set(key, instruments[value]))
                        this.setState({ pageNum: pageNum, instrumentMap: instrumentMap, searchResult: orderEnquirySearchResult.simpleOrders }, () => {
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
        const { exchanges } = this.props
        return {
            pageNum: 1,
            pageSize: PAGE_SIZE_OPTION[0],
            searchCriteria: {exchangeCode: exchanges[0].exchangeCode},
            sortBy: resultColName[0],
            sortDirection: SortDirection.Ascending,
            searchResult: null,
            instrumentMap: new Map()
        }
    }

    viewOrderDetail(orderNumber: string) {
        const { messageService, sessionContext } = this.props
        const { instrumentMap } = this.state

        const cacheContext = sessionContext.cacheContext
        const languageContext = sessionContext.languageContext
        const instrument = instrumentMap.get(orderNumber)
        const instrumentName = instrument ? instrument.getDescription(languageContext.language) : ""
        const currency = instrument ? cacheContext.getCurrency(instrument.tradingCurrencyCode) : null
        const currencyName = currency ? currency.getDescription(languageContext.language) : ""
        const priceFormat = createNumberFormat(true, currency ? currency.decimalPoint : 2)
        const quantityFormat = createNumberFormat(true, 0)
        
        messageService.showLoading()
        const promise = orderService.enquireOrder(orderNumber)
        if (promise) {
            promise.then(
                order => {
                    const keyCol = new XcTableColSpec("key", DataType.String, "", 5)
                    const valueCol = new XcTableColSpec("value", DataType.String, "", 5)
                    const data = [
                        { key: xlate(`${formName}.orderStatus`), value: xlate(`enum.externalOrderStatus.${order.orderStatus}`) },
                        { key: xlate(`${formName}.tradingAccount`), value: order.tradingAccountCode },
                        { key: xlate(`${formName}.exchange`), value: order.exchangeCode },
                        { key: xlate(`${formName}.buySell`), value: xlate(`enum.buySell.${order.buySell}`) },
                        { key: xlate(`${formName}.instrumentCode`), value: `${order.instrumentCode} ${instrumentName}` },
                        { key: xlate(`${formName}.createTradeDate`), value: formatDate(order.createTradeDate) },
                        { key: xlate(`${formName}.updateDateTime`), value: formatDateTime(order.updateDateTime) },
                        { key: xlate(`${formName}.price`), value: `${currencyName} ${formatNumber(order.price, priceFormat)}` },
                        { key: xlate(`${formName}.quantity`), value: order.quantity },
                        { key: xlate(`${formName}.executedQuantity`), value: order.executedQuantity },
                        { key: xlate(`${formName}.grossAmount`), value: `${currencyName} ${formatNumber(order.grossAmount, priceFormat)}` },
                        { key: xlate(`${formName}.charge`), value: `${currencyName} ${formatNumber(order.chargeAmount, priceFormat)}` },
                        { key: xlate(`${formName}.commission`), value: `${currencyName} ${formatNumber(order.commissionAmount, priceFormat)}` },
                        { key: xlate(`${formName}.netAmount`), value: `${currencyName} ${formatNumber(order.netAmount, priceFormat)}` }
                    ]

                    const executeTimeCol = new XcTableColSpec("executeTime", DataType.String, xlate(`${formName}.executionTime`), 3)
                    const executePriceCol = new XcTableColSpec("price", DataType.String, `${xlate(`${formName}.executionPrice`)} (${currencyName})`, 2)
                    const executeQuantityCol = new XcTableColSpec("quantity", DataType.Number, xlate(`${formName}.executionQuantity`), 2)
                    const executionData = _.map(_.sortBy(order.orderExecution, "executeDateTime"), (oe) => {
                        return {executeTime: formatDateTime(oe.executeDateTime), price: formatNumber(oe.price, priceFormat), quantity: formatNumber(oe.quantity, quantityFormat) }
                    })

                    const content = <React.Fragment><br/><XcTable colspec={[keyCol, valueCol]} compact={false} data={data} selectable={false} size={XcTable.Size.Large}></XcTable></React.Fragment>
                    const executionContent = <React.Fragment><br/><XcTable colspec={[executeTimeCol, executePriceCol, executeQuantityCol]} compact={false} data={executionData} selectable={false} size={XcTable.Size.Large}></XcTable></React.Fragment>
                    const okButton = <XcButton icon={{name: 'close'}} label={xlate("general.close")} primary onClick={() => {messageService && messageService.dismissDialog()}} />

                    let panes = []
                    panes.push(<XcNavigationTab.Pane component={content} key="orderDetail" id="orderDetail" label="Order Detail" />)
                    if (_.size(executionData) > 0) {
                        panes.push(<XcNavigationTab.Pane component={executionContent} key="executionDetail" id="executionDetail" label="Execution Detail" />)
                    }
                    const tabContent = <XcNavigationTab style={{height: "50vh"}} >{panes}</XcNavigationTab>

                    const dialog = <XcDialog
                        okButton={okButton}
                        content={tabContent}
                        title={orderNumber}
                        type={XcDialog.Type.Info} />

                    messageService.hideLoading()                
                    messageService.showDialog(dialog);
                    
                },
                error => {
                    // TODO                
                    messageService.hideLoading()
                }
            )
        }            
    }

    portfolioActionSheet = (model: Object) => (
        <XcContextMenu>
            <XcContextMenu.Item title={xlate(`${formName}.detailTitle`)} description={xlate(`${formName}.detailHint`)} buttonLabel={xlate(`${formName}.detailTitle`)} buttonAction={() => { this.viewOrderDetail(model.orderNumber) }} />
        </XcContextMenu>
    )

    createResultColSpec = (cacheContext: CacheContextType, language: Language, exchange: Exchange, instrumentMap: Map<string, Instrument>, sortBy: string, sortDirection: SortDirection): XcTableColSpec[] => {
        const exchangeCurrency = cacheContext.getCurrency(exchange["baseCurrencyCode"])
        const buySellFormatter = (model: Object, fieldName: string) => {
            return xlate(`enum.buySell.${model[fieldName]}`)
        }
        const quantityFormatter = (model: Object, fieldName: string) => {
            return formatNumber(model[fieldName], createNumberFormat(true, 0))
        }
        const priceFormatter = (model: Object, fieldName: string) => {
            // Do not show currency code if equals to exchange currency
            const instrument = instrumentMap.get(model["orderNumber"])
            const orderCurrency = instrument != null ? instrument.tradingCurrencyCode : exchange["baseCurrencyCode"]    // instrument should never be null
            if (orderCurrency == exchange["baseCurrencyCode"]) {
                return exchangeCurrency != null ? `${formatNumber(model[fieldName], createNumberFormat(true, exchangeCurrency.decimalPoint))}` : model[fieldName]
            }
            else {
                const currency = cacheContext.getCurrency(orderCurrency)
                return currency != null ? `${currency.getDescription(language)}  ${formatNumber(model[fieldName], createNumberFormat(true, currency.decimalPoint))}` : model[fieldName]
            }
        }
        const percentFormatter = (model: Object, fieldName: string) => {
            return formatNumber(model[fieldName], createNumberFormat(true, 2))
        }
        const contextMenuProvider = (model: Object, fieldName: string) => {
            return this.portfolioActionSheet(model)
        }
        const searchResultColOrderNumber = new XcTableColSpec(resultColName[0], DataType.String, xlate(`${formName}.${resultColName[0]}`), 1, true, sortBy == resultColName[0] ? sortDirection : null)
        searchResultColOrderNumber.actionSheetProvider = contextMenuProvider
        const searchResultColBuySell = new XcTableColSpec(resultColName[1], DataType.String, xlate(`${formName}.${resultColName[1]}`), 1, true, sortBy == resultColName[1] ? sortDirection : null)
        searchResultColBuySell.formatter = buySellFormatter
        const searchResultColInstrumentCode = new XcTableColSpec(resultColName[2], DataType.String, xlate(`${formName}.${resultColName[2]}`), 1, true, sortBy == resultColName[2] ? sortDirection : null)
        const searchResultColInstrumentName = new XcTableColSpec(resultColName[3], DataType.String, xlate(`${formName}.${resultColName[3]}`), 2, false, sortBy == resultColName[3] ? sortDirection : null)
        const searchResultColPrice = new XcTableColSpec(resultColName[4], DataType.Number, `${xlate(`${formName}.${resultColName[4]}`)}${exchangeCurrency != null ? ` (${exchangeCurrency.getDescription(language)})` : ""}`, 1, true, sortBy == resultColName[4] ? sortDirection : null)
        searchResultColPrice.formatter = priceFormatter
        searchResultColPrice.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColQuantity = new XcTableColSpec(resultColName[5], DataType.Number, xlate(`${formName}.${resultColName[5]}`), 1, true, sortBy == resultColName[5] ? sortDirection : null)
        searchResultColQuantity.formatter = quantityFormatter
        searchResultColQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColExecutedQuantity = new XcTableColSpec(resultColName[6], DataType.Number, xlate(`${formName}.${resultColName[6]}`), 1, true, sortBy == resultColName[6] ? sortDirection : null)
        searchResultColExecutedQuantity.formatter = quantityFormatter
        searchResultColExecutedQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColOrderStatus = new XcTableColSpec(resultColName[7], DataType.String, xlate(`${formName}.${resultColName[7]}`), 1, false, sortBy == resultColName[7] ? sortDirection : null)
        return [
            searchResultColOrderNumber, searchResultColBuySell, searchResultColInstrumentCode, searchResultColInstrumentName, searchResultColPrice, searchResultColQuantity, searchResultColExecutedQuantity, searchResultColOrderStatus
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