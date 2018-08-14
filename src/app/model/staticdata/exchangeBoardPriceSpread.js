// @flow
import _ from 'lodash';
import { BaseModel } from 'shared/model/BaseModel';

export class ExchangeBoardPriceSpread implements BaseModel {
    exchangeBoardCode: string;
    exchangeBoardPriceSpreadCode: string;
    exchangeBoardPriceSpreadDetail: [ExchangeBoardPriceSpreadDetail];

    constructor(exchangeBoardCode: string, exchangeBoardPriceSpreadCode: string, exchangeBoardPriceSpreadDetail: [ExchangeBoardPriceSpreadDetail]) {
        this.exchangeBoardCode = exchangeBoardCode;
        this.exchangeBoardPriceSpreadCode = exchangeBoardPriceSpreadCode;
        this.exchangeBoardPriceSpreadDetail = exchangeBoardPriceSpreadDetail;
    }

    getId(): Object {
        return {
            exchangeBoardCode: this.exchangeBoardCode,
            exchangeBoardPriceSpreadCode: this.exchangeBoardPriceSpreadCode,
        }
    }
    
    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    static fromJson(json: Object): ExchangeBoardPriceSpread {
        const rtn = ExchangeBoardPriceSpread.newInstance()
        Object.assign(rtn, json);
        rtn.exchangeBoardPriceSpreadDetail = _.sortBy(_.map(json.exchangeBoardPriceSpreadDetail, d => ExchangeBoardPriceSpreadDetail.fromJson(d)), ['priceFrom'])
        console.log(rtn)
        return rtn
    }

    static newInstance(): ExchangeBoardPriceSpread {
        return new ExchangeBoardPriceSpread("", "", []);        
    }

    static getId(json: Object): Object {
        return {
            exchangeBoardCode: json.exchangeBoardCode,
            exchangeBoardPriceSpreadCode: json.exchangeBoardPriceSpreadCode
        }        
    }
}

export class ExchangeBoardPriceSpreadDetail {
    priceFrom: number;
    priceTo: number;
    spreadValue: number;

    constructor(priceFrom: number, priceTo: number, spreadValue: number) {
        this.priceFrom = priceFrom
        this.priceTo = priceTo
        this.spreadValue = spreadValue
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    static fromJson(json: Object): ExchangeBoardPriceSpreadDetail {
        const rtn = ExchangeBoardPriceSpreadDetail.newInstance()
        Object.assign(rtn, json);
        return rtn
    }

    static newInstance(): ExchangeBoardPriceSpreadDetail {
        return new ExchangeBoardPriceSpreadDetail(0, 0, 0);        
    }

}