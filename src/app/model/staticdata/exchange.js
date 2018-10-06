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
    exchangeParameter: ExchangeParameter[];

    constructor(exchangeCode: string, nameDefLang: string, shortNameDefLang: string, baseCurrencyCode: string, sequence: number, tradeDate: Date,  exchangeParameter: ExchangeParameter[]) {
        this.exchangeCode = exchangeCode;
        this.nameDefLang = nameDefLang;
        this.shortNameDefLang = shortNameDefLang;
        this.baseCurrencyCode = baseCurrencyCode;
        this.sequence = sequence;
        this.tradeDate = tradeDate;
        this.exchangeParameter = exchangeParameter
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
    
    getInstrumentCodeLength(): number {
        const epInstCodeLen = _.find(this.exchangeParameter, ep => ep.parameterCode == 'LENGTH_INSTRUMENT_NO')
        return epInstCodeLen != null ? epInstCodeLen.getParmeterValueAsInt() : -1
    }

    formatInstrumentCode(stockCode: string): string {
        const epInstCodeFormat = _.find(this.exchangeParameter, ep => ep.parameterCode == 'INSTRUMENT_CODE_FORMAT')

        if (epInstCodeFormat != null) {
            const instCodeLen = this.getInstrumentCodeLength()
            if (instCodeLen > 0 && epInstCodeFormat.parameterValue.length == 1) {
                const rtn = epInstCodeFormat.parameterValue.repeat(instCodeLen) + stockCode
                return rtn.substring(rtn.length - instCodeLen)
            }
        }
        return stockCode
    }

    static fromJson(json: Object): Exchange {
        const rtn = Exchange.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        rtn.exchangeParameter = _.map(json.exchangeParameter, ep => ExchangeParameter.fromJson(ep))
        return rtn
    }

    static newInstance(): Exchange {
        return new Exchange("", "", "", "", 0, new Date(), []);        
    }

    static getId(json: Object): Object {
        return {
            exchangeCode: json.exchangeCode
        }        
    }
}


export class ExchangeParameter {

    parameterCode: string;
    parameterCode: string;
    description: string;
    parameterValue: string;
    lookupTypeCode: ?string;
    sequence: number;
    systemIndicator: boolean;

    constructor(parameterCode: string, description: string, parameterValue: string, lookupTypeCode: ?string, sequence: number, systemIndicator: boolean) {
        this.parameterCode = parameterCode;
        this.description = description;
        this.parameterValue = parameterValue;
        this.lookupTypeCode = lookupTypeCode;
        this.sequence = sequence;
        this.systemIndicator = systemIndicator;
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    getParmeterValueAsInt(): number {
        return parseInt(this.parameterValue)
    }

    getParmeterValueAsFloat(): number {
        return parseFloat(this.parameterValue)
    }

    static fromJson(json: Object): ExchangeParameter {
        const rtn = ExchangeParameter.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): ExchangeParameter {
        return new ExchangeParameter("", "", "", null, 0, true);        
    }

}