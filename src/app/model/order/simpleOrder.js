// @flow
import _ from 'lodash'
import { BuySell, LotNature } from '../EnumType'
import { Instrument } from '../staticdata/instrument'
import { Currency } from '../staticdata/currency'
import { ExchangeBoardPriceSpread } from '../staticdata/exchangeBoardPriceSpread'
import { CHANNEL_CODE } from 'app/constant/ApplicationConstant'

export class SimpleOrder {
    buySell: string;
    tradingAccountCode: string;
    exchangeCode: string;
    instrumentCode: string;
    price: number;
    quantity: number;
    chargeAmount: number;
    commissionAmount: number;
    grossAmount: number;
    netAmount: number;

    constructor(buySell: string, tradingAccountCode: string, exchangeCode: string, instrumentCode: string, price: number, quantity: number, 
        chargeAmount: number, commissionAmount: number, grossAmount: number, netAmount: number) {
        this.buySell = buySell
        this.tradingAccountCode = tradingAccountCode
        this.exchangeCode = exchangeCode
        this.instrumentCode = instrumentCode
        this.price = price
        this.quantity = quantity
        this.chargeAmount = chargeAmount
        this.commissionAmount = commissionAmount
        this.grossAmount = grossAmount
        this.netAmount = netAmount
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
        return new SimpleOrder(BuySell.Buy.value,"", "", "", 0, 0, 0, 0, 0, 0);
    }

}
