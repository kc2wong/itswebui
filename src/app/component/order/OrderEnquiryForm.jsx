// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Toolbar } from 'app/component/common/Toolbar';
import { BASE_CURRENCY, PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency, Exchange, Instrument } from 'app/model/staticdata'
import { BuySell, LotNature, OrderStatus } from 'app/model/EnumType'
import { Order, OrderEnquirySearchResult, SimpleOrder } from 'app/model/order';
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { orderService, simpleOrderService, tradingAccountService } from 'app/service';

import { XcButton, XcButtonGroup, XcCheckbox, XcContextMenu, XcDialog, XcForm, XcFormGroup, XcGrid, XcInputText } from 'shared/component';
import { XcNavigationTab, XcOption, XcPanel, XcPanelBody, XcPanelFooter, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
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
    exchangeCode: string,
    lastUpdate: ?Date,
    outstandingOrder: boolean,
    sortBy: string,
    sortDirection: SortDirection,
    orders: [SimpleOrder],
    instrumentMap: Map<string, Instrument>
}

const formName = "orderEnquiryForm"

const OUTSTANDING_ORDER_STATUS = new Set([OrderStatus.Pending, OrderStatus.New, OrderStatus.Reserved, OrderStatus.WaitForApprove, OrderStatus.Queued, OrderStatus.PartialExecuted])
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
        const navigationContext = sessionContext.navigationContext

        const { exchangeCode, instrumentMap, lastUpdate, outstandingOrder, orders, sortBy, sortDirection } = this.state;
        const exchange = _.find(exchanges, e => e.exchangeCode == exchangeCode)
        const exchangeTradeDate = exchange != null ? minDate(currentDate(), _.minBy(exchanges, "tradeDate").tradeDate) : currentDate()            
        const exchangeCurrency = cacheContext.getCurrency(exchange.baseCurrencyCode)
        const baseCurrency = cacheContext.getCurrency(BASE_CURRENCY)

        const exchangeOrder = _.filter(orders, o => o.exchangeCode == exchangeCode && o.createTradeDate >= exchangeTradeDate && (!outstandingOrder || OUTSTANDING_ORDER_STATUS.has(o.getOrderStatus())) )
        const data = _.map(exchangeOrder, (e) => {
            const instrument: Instrument = instrumentMap.get(e.orderNumber)
            return Object.assign({ instrumentName: instrument != null ? instrument.getDescription(language) : "" }, e,
                { orderStatus: xlate(`enum.externalOrderStatus.${e.orderStatus}`), outstandingOrder: OUTSTANDING_ORDER_STATUS.has(e.getOrderStatus()) })
        })
        const processingOrder = navigationContext.processingOrder
        const highlightedIndex = processingOrder ? _.findIndex(data, o => o.orderNumber == processingOrder.orderNumber) : -1

        const numberFormat = createNumberFormat(true, exchangeCurrency != null ? exchangeCurrency.decimalPoint : 2)
        const searchResultColSpec = this.createResultColSpec(cacheContext, language, exchange, instrumentMap, sortBy, sortDirection)

        return (
            <div style={{ height: "100vh" }}>
                <br />
                <XcGrid>
                    <XcGrid.Row>
                        <XcGrid.Col width={4}>
                            <XcSelect inline label={xlate(`${formName}.exchange`)} onChange={this.handleSelectExchange} options={exchangeOpt} value={exchangeCode} />
                        </XcGrid.Col>
                        <XcGrid.Col width={4}>
                            <XcCheckbox inline label={xlate(`${formName}.outstandingOrderOnly`)} onChange={this.handleToggleOutstandOrder} style={XcCheckbox.Style.Toggle} value={outstandingOrder} />
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
                                <XcGrid.Col width={16}>
                                    <XcTable colspec={searchResultColSpec}
                                        data={data}
                                        highlightedIndex={highlightedIndex}
                                        onSort={this.handleSort}
                                        selectable={false}
                                        size={XcTable.Size.Small}/>
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
        const { orders, instrumentMap } = this.state
 
        if (currentSortBy == sortBy) {
            // reverse only
            this.setState({ sortDirection: sortDirection, orders: _.reverse(orders) })
        }
        else {
            const language = sessionContext.languageContext.language
            let data = _.sortBy(_.map(orders, (e) => {
                let instrument: Instrument = instrumentMap.get(e.orderNumber)
                return Object.assign({instrumentName: instrument != null ? instrument.getDescription(language) : ""}, e, {orderStatus: xlate(`enum.externalOrderStatus.${e.orderStatus}`)})
            }), [sortBy, "orderNumber"])
            if (sortDirection == SortDirection.Descending) {
                data = _.reverse(data)
            }            
            this.setState({ sortBy: sortBy, sortDirection: sortDirection, orders: _.map(data, d => _.find(orders, o => o.orderNumber == d.orderNumber)) })
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
            const exchange = _.find(exchanges, e => e.exchangeCode == exchangeCode)
            const startTradeDate = exchange != null ? minDate(currentDate(), _.minBy(exchanges, "tradeDate").tradeDate) : currentDate()            
            const promise = simpleOrderService.enquireOrder(selectedTradingAccount.tradingAccountCode, exchangeCode, startTradeDate, null)
            if (promise) {
                promise.then(
                    orderEnquirySearchResult => {
                        let orders = orderEnquirySearchResult.simpleOrders.data
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
        return {
            exchangeCode: this.props.exchanges[0].exchangeCode,
            lastUpdate: null,
            outstandingOrder: false,        
            sortBy: "orderNumber",
            sortDirection: SortDirection.Ascending,
            securityPositionSummary: [],
            instrumentMap: new Map()
        }
    }

    amendCancelOrder(orderNumber: string, amend: boolean) {
        const { messageService, sessionContext } = this.props
        const { instrumentMap } = this.state

        const cacheContext = sessionContext.cacheContext
        const languageContext = sessionContext.languageContext
        const instrument = instrumentMap.get(orderNumber)
        
        messageService.showLoading()
        const promise = orderService.enquireOrder(orderNumber)
        if (promise) {
            promise.then(
                order => {
                    messageService.hideLoading()                
                    amend ? sessionContext.navigationContext.navigateToOrderAmendForm(instrument, order) : sessionContext.navigationContext.navigateToOrderCancelForm(instrument, order)                 
                },
                error => {
                    // TODO                
                    messageService.hideLoading()
                }
            )
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
        parseBool(model.outstandingOrder, false) == true ?
            <XcContextMenu style={{ width: "40em" }}>
                <XcContextMenu.Item title={xlate(`${formName}.detailTitle`)} description={xlate(`${formName}.detailHint`)} buttonLabel={xlate(`${formName}.detailTitle`)} buttonAction={() => { this.viewOrderDetail(model.orderNumber) }} />
                <XcContextMenu.Item title={xlate(`${formName}.amendTitle`)} description={xlate(`${formName}.amendHint`)} buttonLabel={xlate(`${formName}.amendTitle`)} buttonAction={() => { this.amendCancelOrder(model.orderNumber, true) }} />
                <XcContextMenu.Item title={xlate(`${formName}.cancelTitle`)} description={xlate(`${formName}.cancelHint`)} buttonLabel={xlate(`${formName}.cancelTitle`)} buttonAction={() => { this.amendCancelOrder(model.orderNumber, false) }} />
            </XcContextMenu>
            :
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
        const resultColName = ["orderNumber", "buySell", "instrumentCode", "instrumentName", "price", "quantity", "executedQuantity", "orderStatus"]
        const searchResultColOrderNumber = new XcTableColSpec(resultColName[0], DataType.String, xlate(`${formName}.${resultColName[0]}`), 1, sortBy == resultColName[0] ? sortDirection : null)
        searchResultColOrderNumber.actionSheetProvider = contextMenuProvider
        const searchResultColBuySell = new XcTableColSpec(resultColName[1], DataType.String, xlate(`${formName}.${resultColName[1]}`), 1, sortBy == resultColName[1] ? sortDirection : null)
        searchResultColBuySell.formatter = buySellFormatter
        const searchResultColInstrumentCode = new XcTableColSpec(resultColName[2], DataType.String, xlate(`${formName}.${resultColName[2]}`), 1, sortBy == resultColName[2] ? sortDirection : null)
        const searchResultColInstrumentName = new XcTableColSpec(resultColName[3], DataType.String, xlate(`${formName}.${resultColName[3]}`), 2, sortBy == resultColName[3] ? sortDirection : null)
        const searchResultColPrice = new XcTableColSpec(resultColName[4], DataType.Number, `${xlate(`${formName}.${resultColName[4]}`)}${exchangeCurrency != null ? ` (${exchangeCurrency.getDescription(language)})` : ""}`, 1, sortBy == resultColName[4] ? sortDirection : null)
        searchResultColPrice.formatter = priceFormatter
        searchResultColPrice.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColQuantity = new XcTableColSpec(resultColName[5], DataType.Number, xlate(`${formName}.${resultColName[5]}`), 1, sortBy == resultColName[5] ? sortDirection : null)
        searchResultColQuantity.formatter = quantityFormatter
        searchResultColQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColExecutedQuantity = new XcTableColSpec(resultColName[6], DataType.Number, xlate(`${formName}.${resultColName[6]}`), 1, sortBy == resultColName[6] ? sortDirection : null)
        searchResultColExecutedQuantity.formatter = quantityFormatter
        searchResultColExecutedQuantity.horizontalAlign = XcTable.TextAlign.Right
        const searchResultColOrderStatus = new XcTableColSpec(resultColName[7], DataType.String, xlate(`${formName}.${resultColName[7]}`), 1, sortBy == resultColName[7] ? sortDirection : null)
        return [
            searchResultColOrderNumber, searchResultColBuySell, searchResultColInstrumentCode, searchResultColInstrumentName, searchResultColPrice, searchResultColQuantity, searchResultColExecutedQuantity, searchResultColOrderStatus
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