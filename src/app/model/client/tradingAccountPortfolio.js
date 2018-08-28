// @flow
import _ from 'lodash'
import { Instrument } from 'app/model/staticdata'

export class SecurityPositionSummary {

    exchangeCode: string;
    instrumentCode: string;
    currencyCode: string;
    averagePrice: number;
    closingPrice: number;
    availableQuantity: number;
    underPayQuantity: number;
    underReceiveQuantity: number;
    duePayQuantity: number;
    dueReceiveQuantity: number;
    overduePayQuantity: number;
    overdueReceiveQuantity: number;
    holdQuantity: number;
    netBalance: number;
    outstandingMasterOrderQuantity: number;
    outstandingOrderQuantity: number;
    sellableQuantity: number;
    stockHolding: number;
    totalQuantity: number;
    unavailableHoldQuantity: number;
    unavailableQuantity: number;
    marketValue: number;
    marketValueBaseCurrency: number;

    constructor(exchangeCode: string, instrumentCode: string, currencyCode: string, 
        averagePrice: number, closingPrice: number, availableQuantity: number, 
        underPayQuantity: number, underReceiveQuantity: number, duePayQuantity: number, dueReceiveQuantity: number,
        overduePayQuantity: number, overdueReceiveQuantity: number, holdQuantity: number, netBalance: number,
        outstandingMasterOrderQuantity: number, outstandingOrderQuantity: number, sellableQuantity: number, stockHolding: number,
        totalQuantity: number, unavailableHoldQuantity: number, unavailableQuantity: number, marketValue: number, marketValueBaseCurrency: number 
    ) {
        this.exchangeCode = exchangeCode
        this.instrumentCode = instrumentCode
        this.currencyCode = currencyCode
        this.averagePrice = averagePrice
        this.closingPrice = closingPrice
        this.availableQuantity = availableQuantity
        this.underPayQuantity = underPayQuantity
        this.underReceiveQuantity = underReceiveQuantity
        this.duePayQuantity = duePayQuantity
        this.dueReceiveQuantity = dueReceiveQuantity
        this.overduePayQuantity = overduePayQuantity
        this.overdueReceiveQuantity = overdueReceiveQuantity
        this.holdQuantity = holdQuantity
        this.netBalance = netBalance
        this.outstandingMasterOrderQuantity = outstandingMasterOrderQuantity
        this.outstandingOrderQuantity = outstandingOrderQuantity
        this.sellableQuantity = sellableQuantity
        this.stockHolding = stockHolding
        this.totalQuantity = totalQuantity
        this.unavailableHoldQuantity = unavailableHoldQuantity
        this.unavailableQuantity = unavailableQuantity
        this.marketValue = marketValue
        this.marketValueBaseCurrency = marketValueBaseCurrency
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): SecurityPositionSummary {
        const rtn = SecurityPositionSummary.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): SecurityPositionSummary {
        return new SecurityPositionSummary("", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

}


export class TradingAccountPortfolio {

    tradingAccountCode: string;
    currencyCode: string;
    totalAvailableBalance: number;
    totalAvailableBalanceBaseCurrency: number;
    totalBalanceAmount: number;
    totalBalanceAmountBaseCurrency: number;
    totalDuePayBaseCurrency: number;
    totalDueReceiveBaseCurrency: number;
    totalOverduePayBaseCurrency: number;
    totalOverdueReceiveBaseCurrency: number;
    totalUnderduePayBaseCurrency: number;
    totalUnderdueReceiveBaseCurrency: number;
    securityPositionSummary: Array<SecurityPositionSummary>;

    constructor(tradingAccountCode: string, currencyCode: string,
        totalAvailableBalance: number, totalAvailableBalanceBaseCurrency: number, totalBalanceAmount: number, 
        totalBalanceAmountBaseCurrency: number, totalDuePayBaseCurrency: number, totalDueReceiveBaseCurrency: number,
        totalOverduePayBaseCurrency: number, totalOverdueReceiveBaseCurrency: number, totalUnderduePayBaseCurrency: number,
        totalUnderdueReceiveBaseCurrency: number, securityPositionSummary: Array<SecurityPositionSummary>
    ) {
        this.tradingAccountCode = tradingAccountCode
        this.currencyCode = currencyCode
        this.totalAvailableBalance = totalAvailableBalance
        this.totalAvailableBalanceBaseCurrency = totalAvailableBalanceBaseCurrency
        this.totalBalanceAmount = totalBalanceAmount
        this.totalBalanceAmountBaseCurrency = totalBalanceAmountBaseCurrency
        this.totalDuePayBaseCurrency = totalDuePayBaseCurrency
        this.totalDueReceiveBaseCurrency = totalDueReceiveBaseCurrency
        this.totalOverduePayBaseCurrency = totalOverduePayBaseCurrency
        this.totalOverdueReceiveBaseCurrency = totalOverdueReceiveBaseCurrency
        this.totalUnderduePayBaseCurrency = totalUnderduePayBaseCurrency
        this.totalUnderdueReceiveBaseCurrency = totalUnderdueReceiveBaseCurrency
        this.securityPositionSummary = securityPositionSummary
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): TradingAccountPortfolio {
        const rtn = TradingAccountPortfolio.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        rtn.securityPositionSummary = _.map(json.securityPositionSummary, (e) =>
            SecurityPositionSummary.fromJson(e)
        )
        return rtn
    }

    static newInstance(): TradingAccountPortfolio {
        return new TradingAccountPortfolio("", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, []);
    }

}

export class TradingAccountPortfolioBundle {
    tradingAccountPortfolio: TradingAccountPortfolio;
    instruments: Array<Instrument>;

    constructor(tradingAccountPortfolio: TradingAccountPortfolio, instruments: Array<Instrument>
    ) {
        this.tradingAccountPortfolio = tradingAccountPortfolio
        this.instruments = instruments
    }    

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): TradingAccountPortfolioBundle {
        const tradingAccountPortfolio = TradingAccountPortfolio.fromJson(json.tradingAccountPortfolio)
        const instruments = _.map(json.instruments, (e) => {
            Instrument.fromJson(e)
        })
        return new TradingAccountPortfolioBundle(tradingAccountPortfolio, instruments)
    }

    static newInstance(): TradingAccountPortfolioBundle {
        return new TradingAccountPortfolioBundle(TradingAccountPortfolio.newInstance(), []);
    }

}