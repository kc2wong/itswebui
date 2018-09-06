// @flow
import _ from 'lodash'
import { BuySell, LotNature } from '../EnumType'
import { Instrument } from '../staticdata/instrument'
import { Currency } from '../staticdata/currency'
import { ExchangeBoardPriceSpread } from '../staticdata/exchangeBoardPriceSpread'
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
    
    static fromJson(json: Object): SimpleOrder {
        const rtn = this.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): SimpleOrder {
        return new SimpleOrder("", BuySell.Buy.value,"", "", "", 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "");
    }

}
