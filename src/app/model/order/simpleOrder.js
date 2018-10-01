// @flow
import _ from 'lodash'
import { BuySell, LotNature, OrderStatus } from '../EnumType'
import { PageResult } from 'shared/model/BaseModel'
import { currentDate, currentDateTime } from 'shared/util/dateUtil';
import { Instrument } from 'app/model/staticdata/instrument'
import { CHANNEL_CODE } from 'app/constant/ApplicationConstant'

export class SimpleOrder {

    orderNumber: string;
    buySell: string;
    tradingAccountCode: string;
    exchangeCode: string;
    instrumentCode: string;
    price: number;
    quantity: number;
    executedQuantity: number;
    chargeAmount: number;
    commissionAmount: number;
    grossAmount: number;
    netAmount: number;
    executedAmount: number;
    orderStatus: string;
    createDateTime: Date;
    createTradeDate: Date;
    updateDateTime: Date;
    updateTradeDate: Date;
    rejectReason: ?string;

    constructor(orderNumber: string, buySell: string, tradingAccountCode: string, exchangeCode: string, instrumentCode: string, 
        price: number, quantity: number, executedQuantity: number, chargeAmount: number, commissionAmount: number,
        grossAmount: number, netAmount: number, executedAmount: number, orderStatus: string,
        createDateTime: Date, createTradeDate: Date, updateDateTime: Date, updateTradeDate: Date) {
        this.orderNumber = orderNumber
        this.buySell = buySell
        this.tradingAccountCode = tradingAccountCode
        this.exchangeCode = exchangeCode
        this.instrumentCode = instrumentCode
        this.price = price
        this.quantity = quantity
        this.executedQuantity = executedQuantity
        this.chargeAmount = chargeAmount
        this.commissionAmount = commissionAmount
        this.grossAmount = grossAmount
        this.netAmount = netAmount
        this.executedAmount = executedAmount
        this.orderStatus = orderStatus
        this.createDateTime = createDateTime
        this.createTradeDate = createTradeDate
        this.updateDateTime = updateDateTime
        this.updateTradeDate = updateTradeDate
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this)
        return rtn        
    }

    getBuySell(): BuySell {
        return _.find(BuySell.enumValues, e => e.value == this.buySell)        
    }

    getOrderStatus(): OrderStatus {
        return _.find(OrderStatus.enumValues, e => e.value == this.orderStatus)        
    }

    static fromJson(json: Object): SimpleOrder {
        const rtn = this.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): SimpleOrder {
        const today = currentDate()
        const now = currentDateTime()
        return new SimpleOrder("", BuySell.Buy.value,"", "", "", 0, 0, 0, 0, 0, 0, 0, 0, "", now, today, now, today);
    }

}

export class OrderEnquirySearchResult {
    simpleOrders: PageResult<SimpleOrder>;
    instruments: Array<Instrument>;
    orderInstrumentIndex: Map<string, number>;

    constructor(simpleOrders: PageResult<SimpleOrder>, instruments: Array<Instrument>, orderInstrumentIndex: Map<string, number>) {
        this.simpleOrders = simpleOrders
        this.instruments = instruments
        this.orderInstrumentIndex = orderInstrumentIndex
    }    

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(criteria: Object, json: Object): OrderEnquirySearchResult {
        const data = _.map(json.content, e => SimpleOrder.fromJson(e))
        const simpleOrders = new PageResult(criteria, json.currentPage + 1, json.pageSize, json.totalPage, json.totalCount, json.hasNext, data)
        const instruments = _.map(json.extraContent.instrumentList, e => Instrument.fromJson(e))
        const orderInstrumentIndex = new Map()
        _.forEach(json.extraContent.orderInstrumentIndex, (value, key) => orderInstrumentIndex.set(key, value))
        return new OrderEnquirySearchResult(simpleOrders, instruments, orderInstrumentIndex)
    }

    // static newInstance(): OrderEnquirySearchResult {
    //     return new OrderEnquirySearchResult([], [], new Map());
    // }

}

export class OrderExecution {

    price: number;
    quantity: number;
    sellerBroker: ?string;
    buyerBroker: ?string;
    splitIndicator: boolean;
    voidIndicator: boolean;
    executeTradeDate: Date;
    executeDateTime: Date;
    source: ?string;

    constructor(price: number, quantity: number, sellerBroker: ?string, buyerBroker: ?string, 
        splitIndicator: boolean, voidIndicator: boolean, 
        executeTradeDate: Date, executeDateTime: Date, source: ?string) {

        this.price = price
        this.quantity = quantity
        this.sellerBroker = sellerBroker
        this.buyerBroker = buyerBroker
        this.splitIndicator = splitIndicator
        this.voidIndicator = voidIndicator
        this.executeTradeDate = executeTradeDate
        this.executeDateTime = executeDateTime
        this.source = source
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): OrderExecution {
        const rtn = this.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): OrderExecution {
        return new OrderExecution(0, 0, null, null, false, false, currentDate(), currentDateTime(), null);
    }


}

export class Order extends SimpleOrder {

    orderExecution: OrderExecution[];

    constructor(orderNumber: string, buySell: string, tradingAccountCode: string, exchangeCode: string, instrumentCode: string,
        price: number, quantity: number, executedQuantity: number, chargeAmount: number, commissionAmount: number,
        grossAmount: number, netAmount: number, executedAmount: number, orderStatus: string,
        createDateTime: Date, createTradeDate: Date, updateDateTime: Date, updateTradeDate: Date, orderExecution: OrderExecution[]) {

        super(orderNumber, buySell, tradingAccountCode, exchangeCode, instrumentCode,
            price, quantity, executedQuantity, chargeAmount, commissionAmount,
            grossAmount, netAmount, executedAmount, orderStatus,
            createDateTime, createTradeDate, updateDateTime, updateTradeDate)
        this.orderExecution = orderExecution
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this)
        return rtn        
    }

    getBuySell(): BuySell {
        return _.find(BuySell.enumValues, e => e.value == this.buySell)        
    }

    getOrderStatus(): OrderStatus {
        return _.find(OrderStatus.enumValues, e => e.value == this.orderStatus)        
    }

    static fromJson(json: Object): SimpleOrder {
        const rtn = this.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        if (json.orderExecution != null) {
            rtn.orderExecution = _.map(json.orderExecution, oe => OrderExecution.fromJson(oe))
        }
        return rtn
    }

    static newInstance(): Order {
        const today = currentDate()
        const now = currentDateTime()
        return new Order("", BuySell.Buy.value,"", "", "", 0, 0, 0, 0, 0, 0, 0, 0, "", now, today, now, today, []);
    }

}