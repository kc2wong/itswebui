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
        Object.assign(rtn, json);
        rtn.suspend = (json.suspend == "Y")
        return rtn
    }

    static newInstance(): Instrument {
        return new Instrument("", "", "", "", "", "", "", 0, 0, 0, false)
    }

}

export class PriceQuote implements MultiLingual {

    exchangCode: string;
    instrumentCode: string;
    currencyCode: string;
    shortNameDefLang: string;
    shortName2ndLang: ?string;
    shortName3rdLang: ?string;
    nominalPrice: ?number;
    closingPrice: ?number;
    priceChange: ?number;
    percentChange: ?number;
    bidPrice: ?number;
    askPrice: ?number;
    dayHigh: ?number;
    dayLow: ?number;
    fiftyTwoWeekHigh: ?number;
    fiftyTwoWeekLow: ?number;
    turnover: ?number;

    constructor(exchangCode: string, instrumentCode: string, currencyCode: string, 
        shortNameDefLang: string, shortName2ndLang: ?string, shortName3rdLang: ?string,
        nominalPrice: ?number, closingPrice: ?number, priceChange: ?number, percentChange: ?number,
        bidPrice: ?number, askPrice: ?number, dayHigh: ?number, dayLow: ?number,
        fiftyTwoWeekHigh: ?number, fiftyTwoWeekLow: ?number, turnover: ?number) {
        this.exchangCode = exchangCode;
        this.instrumentCode = instrumentCode;
        this.currencyCode = currencyCode;
        this.shortNameDefLang = shortNameDefLang;
        this.shortName2ndLang = shortName2ndLang;
        this.shortName3rdLang = shortName3rdLang;
        this.nominalPrice = nominalPrice;
        this.closingPrice = closingPrice;
        this.priceChange = priceChange;
        this.percentChange = percentChange;
        this.bidPrice = bidPrice;
        this.askPrice = askPrice;
        this.dayHigh = dayHigh;
        this.dayLow = dayLow;
        this.fiftyTwoWeekHigh = fiftyTwoWeekHigh;
        this.fiftyTwoWeekLow = fiftyTwoWeekLow;
        this.turnover = turnover;
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
        else if (language == Language.SimplifiedChinese ) {
            rtn = this.shortName3rdLang
        }
        if (!rtn) {
            rtn = this.shortNameDefLang
        }
        return rtn        
    }
    
    static fromJson(json: Object): PriceQuote {
        const rtn = PriceQuote.newInstance()
        Object.assign(rtn, json);
        return rtn
    }

    static newInstance(): PriceQuote {
        return new PriceQuote("", "", "", "", null, null, null, null, null, null, null, null, null, null, null, null, null)
    }

}