// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Toolbar } from 'app/component/common/Toolbar';
import { BASE_CURRENCY, PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { Currency, Exchange, Instrument } from 'app/model/staticdata'
import { BuySell, LotNature, OrderStatus } from 'app/model/EnumType'
import { OrderEnquirySearchResult, SimpleOrder } from 'app/model/order';
import { ApplicationContext, type AccountContextType, type CacheContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { orderService, simpleOrderService, tradingAccountService } from 'app/service';

import { XcButton, XcButtonGroup, XcCheckbox, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow, XcInputText } from 'shared/component';
import { XcOption, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Language, Pageable, PageResult, SortDirection } from 'shared/model';
import { MessageService } from 'shared/service'
import { createNumberFormat, formatNumber, roundNumber, xlate } from 'shared/util/lang'
import { currentDate, formatDateTime, minDate } from 'shared/util/dateUtil'

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

        const { exchangeCode, instrumentMap, lastUpdate, outstandingOrder, orders, sortBy, sortDirection } = this.state;
        const exchange = _.find(exchanges, e => e.exchangeCode == exchangeCode)
        const exchangeCurrency = cacheContext.getCurrency(exchange.baseCurrencyCode)
        const baseCurrency = cacheContext.getCurrency(BASE_CURRENCY)

        const exchangeOrder = _.filter(orders, o => o.exchangeCode == exchangeCode && (!outstandingOrder || OUTSTANDING_ORDER_STATUS.has(o.getOrderStatus())) )
        const data = _.map(exchangeOrder, e => Object.assign({instrumentName: instrumentMap.get(e.orderNumber).getDescription(language)}, e))

        const numberFormat = createNumberFormat(true, exchangeCurrency != null ? exchangeCurrency.decimalPoint : 2)
        const searchResultColSpec = this.createResultColSpec(cacheContext, language, exchange, instrumentMap, sortBy, sortDirection)

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
            let data = _.sortBy(_.map(orders, e => Object.assign({instrumentName: instrumentMap.get(e.orderNumber).getDescription(language)}, e)), [sortBy])
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
            const startTradeDate = exchange != null ? minDate(currentDate(), exchange.tradeDate) : currentDate()
            const promise = simpleOrderService.enquireOrder(selectedTradingAccount.tradingAccountCode, exchangeCode, startTradeDate, null)
            if (promise) {
                promise.then(
                    orderEnquirySearchResult => {
                        console.log(orderEnquirySearchResult)
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
            const orderCurrency = instrumentMap.get(model["orderNumber"]).tradingCurrencyCode
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
        const contentProvider = (model: Object, fieldName: string) => {
            return this.portfolioActionSheet(model)
        }
        const resultColName = ["orderNumber", "buySell", "instrumentCode", "instrumentName", "price", "quantity", "executedQuantity", "orderStatus"]
        const searchResultColOrderNumber = new XcTableColSpec(resultColName[0], DataType.String, xlate(`${formName}.${resultColName[0]}`), 1, sortBy == resultColName[0] ? sortDirection : null)
        searchResultColOrderNumber.actionSheetProvider = contentProvider
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