// @flow
import _ from 'lodash'
import { BuySell, LotNature } from '../EnumType'
import { Instrument } from '../staticdata/instrument'
import { Currency } from '../staticdata/currency'
import { ExchangeBoardPriceSpread } from '../staticdata/exchangeBoardPriceSpread'
import { CHANNEL_CODE } from 'app/constant/ApplicationConstant'

export class OrderRequest {
    buySell: string;
    operationUnitCode: string;
    tradingAccountCode: string;
    exchangeCode: string;
    instrumentCode: string;
    channelCode: string;
    orderTypeCode: string;
    lotNature: string;
    price: number;
    quantity: number;

    constructor(buySell: string, operationUnitCode: string, tradingAccountCode: string, exchangeCode: string, instrumentCode: string, channelCode: string, orderTypeCode: string, lotNature: string, price: number, quantity: number) {
        this.buySell = buySell
        this.operationUnitCode = operationUnitCode
        this.tradingAccountCode = tradingAccountCode
        this.exchangeCode = exchangeCode
        this.instrumentCode = instrumentCode
        this.channelCode = channelCode
        this.orderTypeCode = orderTypeCode
        this.lotNature = lotNature
        this.quantity = quantity
        this.price = price
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this)
        return rtn        
    }
    
    static fromJson(json: Object): OrderRequest {
        const rtn = this.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): OrderRequest {
        return new OrderRequest("","", "", "", "", CHANNEL_CODE, "E", LotNature.Board.value, 0, 0);
    }

}

export class OrderInputResourceBundle {
    instrument: ?Instrument;
    currency: ?Currency;
    exchangeBoardPriceSpread: ?ExchangeBoardPriceSpread;

    constructor(instrument: ?Instrument, currency: ?Currency, exchangeBoardPriceSpread: ?ExchangeBoardPriceSpread) {
        this.instrument = instrument
        this.currency = currency
        this.exchangeBoardPriceSpread = exchangeBoardPriceSpread
    }

    static fromJson(json: Object): OrderInputResourceBundle {
        const rtn = this.newInstance()
        rtn.instrument = json.instrument ? Instrument.fromJson(json.instrument) : null
        rtn.currency = json.currency ? Currency.fromJson(json.currency) : null
        rtn.exchangeBoardPriceSpread = json.exchangeBoardPriceSpread ? ExchangeBoardPriceSpread.fromJson(json.exchangeBoardPriceSpread) : null
        return rtn
    }

    static newInstance(): OrderInputResourceBundle {
        return new OrderInputResourceBundle(null, null, null);
    }

}