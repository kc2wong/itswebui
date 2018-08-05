// @flow
import { BaseModel } from 'shared/model/BaseModel';

export class Currency implements BaseModel {
    currencyOid: string;
    currencyCode: string;
    descptDefLang: string;
    descpt2ndLang: ?string;
    descpt3rdLang: ?string;
    isoCode: ?string;
    decimalPoint: number;
    unit: ?string;
    subUnit: ?string;

    constructor(currencyCode: string, descptDefLang: string, decimalPoint: number) {
        this.currencyOid = "";
        this.currencyCode = currencyCode;
        this.descptDefLang = descptDefLang;
        this.decimalPoint = decimalPoint;
        this.descpt2ndLang = null;
        this.descpt3rdLang = null;
        this.isoCode = null;
        this.unit = null;
        this.subUnit = null;
    }

    getId(): Object {
        return {
            currencyOid: this.currencyOid
        }
    }
    
    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    static fromJson(json: Object): Currency {
        const rtn = new Currency("", "", 0);
        Object.assign(rtn, json);
        return rtn
    }

    static newInstance(): Currency {
        return new Currency("", "", 0);        
    }

    static getId(json: Object): Object {
        return {
            currencyOid: json.currencyOid
        }        
    }
}