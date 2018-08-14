// @flow
import { BaseModel, MultiLingual } from 'shared/model/BaseModel'
import { Language } from 'shared/util/lang'

export class Currency implements BaseModel, MultiLingual {
    currencyCode: string;
    descptDefLang: string;
    descpt2ndLang: ?string;
    descpt3rdLang: ?string;
    isoCode: ?string;
    decimalPoint: number;
    unitName: ?string;
    subUnitName: ?string;

    constructor(currencyCode: string, descptDefLang: string, decimalPoint: number) {
        this.currencyCode = currencyCode;
        this.descptDefLang = descptDefLang;
        this.decimalPoint = decimalPoint;
        this.descpt2ndLang = null;
        this.descpt3rdLang = null;
        this.isoCode = null;
        this.unitName = null;
        this.subUnitName = null;
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
    
    getDescription(language: Language): string {
        var rtn: ?string
        if (language == Language.TraditionalChinese ) {
            rtn = this.descpt2ndLang
        }
        if (!rtn) {
            rtn = this.currencyCode
        }
        return rtn        
    }

    static fromJson(json: Object): Currency {
        const rtn = Currency.newInstance()
        Object.assign(rtn, json);
        return rtn
    }

    static newInstance(): Currency {
        return new Currency("", "", 0);        
    }

    static getId(json: Object): Object {
        return {
            currencyCode: json.currencyCode
        }        
    }
}