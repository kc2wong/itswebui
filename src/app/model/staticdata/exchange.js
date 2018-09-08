// @flow
import _ from 'lodash'
import { BaseModel } from 'shared/model/BaseModel';

export class Exchange implements BaseModel {
    exchangeCode: string;
    nameDefLang: string;
    name2ndLang: ?string;
    name3rdLang: ?string;
    shortNameDefLang: string;
    shortName2ndLang: ?string;
    shortName3rdLang: ?string;
    baseCurrencyCode: string;
    sequence: number;
    tradeDate: ?Date;

    constructor(exchangeCode: string, nameDefLang: string, shortNameDefLang: string, baseCurrencyCode: string, sequence: number, tradeDate: Date) {
        this.exchangeCode = exchangeCode;
        this.nameDefLang = nameDefLang;
        this.shortNameDefLang = shortNameDefLang;
        this.baseCurrencyCode = baseCurrencyCode;
        this.sequence = sequence;
        this.tradeDate = tradeDate;
    }

    getId(): Object {
        return {
            exchangeCode: this.exchangeCode
        }
    }
    
    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    static fromJson(json: Object): Exchange {
        const rtn = Exchange.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): Exchange {
        return new Exchange("", "", "", "", 0, new Date());        
    }

    static getId(json: Object): Object {
        return {
            exchangeCode: json.exchangeCode
        }        
    }
}