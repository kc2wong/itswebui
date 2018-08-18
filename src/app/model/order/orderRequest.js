// @flow
import { Instrument } from '../staticdata/instrument'
import { Currency } from '../staticdata/currency'
import { ExchangeBoardPriceSpread } from '../staticdata/exchangeBoardPriceSpread'

export class OrderRequest {
    side: string;
    caccOid: string;
    exchangeCode: string;
    instrumentCode: string;
    quantity: number;
    price: number;

    constructor(side: string, caccOid: string, exchangeCode: string, instrumentCode: string, quantity: number, price: number) {
        this.side = side
        this.caccOid = caccOid
        this.exchangeCode = exchangeCode
        this.instrumentCode = instrumentCode
        this.quantity = quantity
        this.price = price
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    static fromJson(json: Object): OrderRequest {
        const rtn = this.newInstance()
        Object.assign(rtn, json)
        return rtn
    }

    static newInstance(): OrderRequest {
        return new OrderRequest("","", "", "", 0, 0);
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