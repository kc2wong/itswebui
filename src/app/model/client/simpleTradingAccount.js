// @flow
import _ from 'lodash'
export class SimpleTradingAccount {

    tradingAccountCode: string;
    nameOneDefLang: string;
    nameOne2ndLang: ?string;
    nameOne3rdLang: ?string;
    nameTwoDefLang: ?string;
    nameTwo2ndLang: ?string;
    nameTwo3rdLang: ?string;
    shortNameDefLang: string;
    shortName2ndLang: ?string;
    shortName3rdLang: ?string;
    tradingAccountTypeCode: string;

    constructor(tradingAccountCode: string, nameOneDefLang: string, nameOne2ndLang: ?string, nameOne3rdLang: ?string, 
        nameTwoDefLang: ?string, nameTwo2ndLang: ?string, nameTwo3rdLang: ?string, 
        shortNameDefLang: string, shortName2ndLang: ?string, shortName3rdLang: ?string, tradingAccountTypeCode: string) {

        this.tradingAccountCode = tradingAccountCode
        this.nameOneDefLang = nameOneDefLang
        this.nameOne2ndLang = nameOne2ndLang
        this.nameOne3rdLang = nameOne3rdLang
        this.nameTwoDefLang = nameTwoDefLang
        this.nameTwo2ndLang = nameTwo2ndLang
        this.nameTwo3rdLang = nameTwo3rdLang
        this.shortNameDefLang = shortNameDefLang
        this.shortName2ndLang = shortName2ndLang
        this.shortName3rdLang = shortName3rdLang
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): SimpleTradingAccount {
        const rtn = this.newInstance()
        // Object.assign(rtn, _.pick(json, rtn.toJson().keys()))
        Object.assign(rtn, json)
        return rtn
    }

    static newInstance(): SimpleTradingAccount {
        return new SimpleTradingAccount("", "", null, null, null, null, null, "", null, null, "");
    }

}
