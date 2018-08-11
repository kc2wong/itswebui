// @flow
import { BaseModel, MultiLingual } from 'shared/model/BaseModel';
import { Language } from 'shared/util/lang';

export class Instrument implements BaseModel, MultiLingual {
    instrumentCode: string;
    exchangCode: string;
    exchangeBoardCode: string;
    exchangeBoardPsCode: string;
    nameDefLang: string;
    name2ndLang: ?string;
    name3rdLang: ?string;
    shortNameDefLang: string;
    shortName2ndLang: ?string;
    shortName3rdLang: ?string;
    tradingCurrencyCode: string;
    lotSize: number;
    priceDecimal: number;
    priceUnit: number;
    suspend: boolean;

    constructor(instrumentCode: string, exchangCode: string, exchangeBoardCode: string, 
        exchangeBoardPsCode: string, nameDefLang: string, shortNameDefLang: string, tradingCurrencyCode: string, 
        lotSize: number, priceDecimal: number, priceUnit: number, suspend: boolean) {
        this.instrumentCode = instrumentCode;
        this.exchangeBoardCode = exchangeBoardCode;
        this.exchangeBoardPsCode = exchangeBoardPsCode;
        this.nameDefLang = nameDefLang;
        this.shortNameDefLang = shortNameDefLang;
        this.tradingCurrencyCode = tradingCurrencyCode;
        this.lotSize = lotSize;
        this.priceDecimal = priceDecimal;
        this.priceUnit = priceUnit;
        this.suspend = suspend;
        this.name2ndLang = null;
        this.name3rdLang = null;
        this.shortName2ndLang = null;
        this.shortName3rdLang = null;
    }

    getId(): Object {
        return {
            exchangCode: this.exchangCode,
            instrumentCode: this.instrumentCode,
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
            rtn = this.shortName2ndLang
        }
        if (!rtn) {
            rtn = this.shortNameDefLang
        }
        return rtn        
    }
    
    static fromJson(json: Object): Instrument {
        const rtn = Instrument.newInstance()
        return rtn
    }

    static newInstance(): Instrument {
        return new Instrument("", "", "", "", "", "", "", 0, 0, 0, false)
    }

}