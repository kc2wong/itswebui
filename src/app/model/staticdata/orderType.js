// @flow
import { BaseModel, MultiLingual } from 'shared/model/BaseModel'
import { Language } from 'shared/util/lang'

export class OrderType implements BaseModel, MultiLingual {
    orderTypeCode: string;
    descptDefLang: string;
    descpt2ndLang: ?string;
    descpt3rdLang: ?string;
    sequence: number;
    priceAllowedIndicator: boolean;
    priceRequiredForEaIndicator: boolean;

    constructor(orderTypeCode: string, descptDefLang: string, sequence: number, priceAllowedIndicator: boolean, priceRequiredForEaIndicator: boolean) {
        this.orderTypeCode = orderTypeCode
        this.descptDefLang = descptDefLang
        this.descpt2ndLang = null
        this.descpt3rdLang = null
        this.sequence = sequence
        this.priceAllowedIndicator = priceAllowedIndicator
        this.priceRequiredForEaIndicator = priceRequiredForEaIndicator
    }

    getId(): Object {
        return {
            orderTypeCode: this.orderTypeCode
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
        if (language == Language.SimplifiedChinese ) {
            rtn = this.descpt3rdLang
        }
        if (!rtn) {
            rtn = this.descptDefLang
        }
        return rtn        
    }

    static fromJson(json: Object): OrderType {
        const rtn = OrderType.newInstance()
        Object.assign(rtn, json);
        return rtn
    }

    static newInstance(): OrderType {
        return new OrderType("", "", 0, true, true);        
    }

}