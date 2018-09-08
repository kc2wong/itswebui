// @flow
import _ from 'lodash'
import { BuySell, LotNature, OrderStatus } from '../EnumType'
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
    createDateTime: string;
    createTradeDate: string;
    updateDateTime: string;
    updateTradeDate: string;
    rejectReason: ?string;

    constructor(orderNumber: string, buySell: string, tradingAccountCode: string, exchangeCode: string, instrumentCode: string, 
        price: number, quantity: number, executedQuantity: number, chargeAmount: number, commissionAmount: number,
        grossAmount: number, netAmount: number, executedAmount: number, orderStatus: string,
        createDateTime: string, createTradeDate: string, updateDateTime: string, updateTradeDate: string) {
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
        return new SimpleOrder("", BuySell.Buy.value,"", "", "", 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "");
    }

}

export class OrderEnquirySearchResult {
    simpleOrders: Array<SimpleOrder>;
    instruments: Array<Instrument>;
    orderInstrumentIndex: Map<string, number>;

    constructor(simpleOrders: Array<SimpleOrder>, instruments: Array<Instrument>, orderInstrumentIndex: Map<string, number>) {
        this.simpleOrders = simpleOrders
        this.instruments = instruments
        this.orderInstrumentIndex = orderInstrumentIndex
    }    

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): OrderEnquirySearchResult {
        const simpleOrders = _.map(json.simpleOrders, e => SimpleOrder.fromJson(e))
        const instruments = _.map(json.instruments, e => Instrument.fromJson(e))
        const orderInstrumentIndex = new Map()
        _.forEach(json.orderInstrumentIndex, (value, key) => orderInstrumentIndex.set(key, value))
        return new OrderEnquirySearchResult(simpleOrders, instruments, orderInstrumentIndex)
    }

    static newInstance(): OrderEnquirySearchResult {
        return new OrderEnquirySearchResult([], [], new Map());
    }

}