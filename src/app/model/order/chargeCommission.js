// @flow
import _ from 'lodash'

export class ChargeCommission {
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
    
    static fromJson(json: Object): ChargeCommission {
        const rtn = this.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): ChargeCommission {
        return new ChargeCommission("","", "", "", 0, 0, 0, 0, 0, 0);
    }

}
