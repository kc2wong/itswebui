// @flow
import _ from 'lodash'
import { Currency, Instrument } from 'app/model/staticdata'

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
        return new SecurityPositionSummary("", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    }
}

export class CashPortfolio {

    currencyCode: string;
    availableBalance: number;
    availableBalanceBaseCcy: number;
    balanceAmount: number;
    balanceAmountBaseCcy: number;
    cashHolding: number;
    cashHoldingBaseCcy: number;
    duePayAmount: number;
    dueReceiveAmount: number;
    overduePayAmount: number;
    overdueReceiveAmount: number;
    underduePayAmount: number;
    underdueReceiveAmount: number;
    holdAmount: number;
    netAmount: number;
    interestPayAmount: number;
    interestReceiveAmount: number;
    settledAccountBalance: number;
    unavailableAmount: number;

    constructor(currencyCode: string, availableBalance: number, availableBalanceBaseCcy: number, 
        balanceAmount: number, balanceAmountBaseCcy: number, cashHolding: number, cashHoldingBaseCcy: number,
        duePayAmount: number, dueReceiveAmount: number, overduePayAmount: number, overdueReceiveAmount: number, underduePayAmount: number, underdueReceiveAmount: number, 
        holdAmount: number, netAmount: number, interestPayAmount: number, interestReceiveAmount: number, settledAccountBalance: number, unavailableAmount: number 
    ) {
        this.currencyCode = currencyCode
        this.availableBalance = availableBalance
        this.availableBalanceBaseCcy = availableBalanceBaseCcy
        this.balanceAmount = balanceAmount
        this.balanceAmountBaseCcy = balanceAmountBaseCcy
        this.cashHolding = cashHolding
        this.cashHoldingBaseCcy = cashHoldingBaseCcy
        this.duePayAmount = duePayAmount
        this.dueReceiveAmount = dueReceiveAmount
        this.overduePayAmount = overduePayAmount
        this.overdueReceiveAmount = overdueReceiveAmount
        this.underduePayAmount = underduePayAmount
        this.underdueReceiveAmount = underdueReceiveAmount
        this.holdAmount = holdAmount
        this.netAmount = netAmount
        this.interestPayAmount = interestPayAmount
        this.interestReceiveAmount = interestReceiveAmount
        this.settledAccountBalance = settledAccountBalance
        this.unavailableAmount = unavailableAmount
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): CashPortfolio {
        const rtn = CashPortfolio.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        return rtn
    }

    static newInstance(): CashPortfolio {
        return new CashPortfolio("", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    }
}

export class TradingAccountPurchasePower {

    creditRiskCurrencyCode: string;
    applyBankIndicator: boolean;
    applyCashIndicator: boolean;
    applyCollateralIndicator: boolean;
    applyCreditLineIndicator: boolean;
    creditLineForAllStockIndicator: boolean;
    availableCreditLine: number;
    cashBalance: number;
    cashPurchasePower: number;
    holdAmount: number;
    netPurchasePower: number;
    totalBankAccountBalance: number;
    totalPurchasePower: number;
    ucaAmount: number

    constructor(creditRiskCurrencyCode: string, 
        applyBankIndicator: boolean, applyCashIndicator: boolean, applyCollateralIndicator: boolean, applyCreditLineIndicator: boolean, creditLineForAllStockIndicator: boolean,
        availableCreditLine: number, cashBalance: number, cashPurchasePower: number, holdAmount: number, netPurchasePower: number,
        totalBankAccountBalance: number, totalPurchasePower: number, ucaAmount: number
    ) {
        this.creditRiskCurrencyCode = creditRiskCurrencyCode
        this.applyBankIndicator = applyBankIndicator
        this.applyCashIndicator = applyCashIndicator
        this.applyCollateralIndicator = applyCollateralIndicator
        this.applyCreditLineIndicator = applyCreditLineIndicator
        this.creditLineForAllStockIndicator = creditLineForAllStockIndicator
        this.availableCreditLine = availableCreditLine
        this.cashBalance = cashBalance
        this.cashPurchasePower = cashPurchasePower
        this.holdAmount = holdAmount
        this.netPurchasePower = netPurchasePower
        this.totalBankAccountBalance = totalBankAccountBalance
        this.totalPurchasePower = totalPurchasePower
        this.ucaAmount = ucaAmount
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): TradingAccountPurchasePower {
        const rtn = TradingAccountPurchasePower.newInstance()
        Object.assign(rtn, _.pick(json, Object.keys(rtn.toJson())))
        rtn.applyBankIndicator = (json.applyBankIndicator == "Y")
        rtn.applyCashIndicator = (json.applyCashIndicator == "Y")
        rtn.applyCreditLineIndicator = (json.applyCreditLineIndicator == "Y")
        rtn.creditLineForAllStockIndicator = (json.creditLineForAllStockIndicator == "Y")
        return rtn
    }

    static newInstance(): TradingAccountPurchasePower {
        return new TradingAccountPurchasePower("", false, false, false, false, false, 0, 0, 0, 0, 0, 0, 0, 0)
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
    cashPortfolio: Array<CashPortfolio>;
    purchasePower: ?TradingAccountPurchasePower;

    constructor(tradingAccountCode: string, currencyCode: string,
        totalAvailableBalance: number, totalAvailableBalanceBaseCurrency: number, totalBalanceAmount: number, 
        totalBalanceAmountBaseCurrency: number, totalDuePayBaseCurrency: number, totalDueReceiveBaseCurrency: number,
        totalOverduePayBaseCurrency: number, totalOverdueReceiveBaseCurrency: number, totalUnderduePayBaseCurrency: number,
        totalUnderdueReceiveBaseCurrency: number, securityPositionSummary: Array<SecurityPositionSummary>, cashPortfolio: Array<CashPortfolio>, purchasePower: ?TradingAccountPurchasePower
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
        this.cashPortfolio = cashPortfolio
        this.purchasePower = purchasePower
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
        rtn.cashPortfolio = _.map(json.cashPortfolio, (e) =>
            CashPortfolio.fromJson(e)
        )
        if (json.purchasePower) {
            rtn.purchasePower = TradingAccountPurchasePower.fromJson(json.purchasePower)
        }
        return rtn
    }

    static newInstance(): TradingAccountPortfolio {
        return new TradingAccountPortfolio("", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], [], null);
    }

}

export class TradingAccountPortfolioBundle {
    currencies: Array<Currency>;
    instruments: Array<Instrument>;
    tradingAccountPortfolio: TradingAccountPortfolio;

    constructor(currencies: Array<Currency>, instruments: Array<Instrument>, tradingAccountPortfolio: TradingAccountPortfolio) {
        this.currencies = currencies
        this.instruments = instruments
        this.tradingAccountPortfolio = tradingAccountPortfolio
    }    

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn
    }

    static fromJson(json: Object): TradingAccountPortfolioBundle {
        const tradingAccountPortfolio = TradingAccountPortfolio.fromJson(json.tradingAccountPortfolio)
        const instruments = _.map(json.instruments, (e) =>
            Instrument.fromJson(e)
        )
        const currencies = _.map(json.currencies, (e) =>
            Currency.fromJson(e)
        )
        return new TradingAccountPortfolioBundle(currencies, instruments, tradingAccountPortfolio)
    }

    static newInstance(): TradingAccountPortfolioBundle {
        return new TradingAccountPortfolioBundle([], [], TradingAccountPortfolio.newInstance());
    }

}