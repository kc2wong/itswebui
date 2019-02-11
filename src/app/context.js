// @flow
import _ from 'lodash';
import React from 'react';
import { Language, xlate } from 'shared/util/lang';
import { MessageService } from 'shared/service';
import { XcDialog } from 'shared/component';
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'
import { Order, OrderInputRequest } from 'app/model/order'
import { Currency, Instrument, ExchangeBoardPriceSpread, OrderType } from 'app/model/staticdata'

export type ApplicationContextType = {
    messageService: MessageService
}

export const ApplicationContext = React.createContext({
    messageService: {
        hideLoading: () => {},
        showLoading: () => {},
        dismissDialog: () => {},
        showDialog: (dialog: XcDialog) => {},
        isDialogShowing: () => {return false}    
    }    
});

export type CacheContextType = {
    getCurrency: (currencyCode: string) => ?Currency,
    getCurrencies: () => Currency[],
    getExchangeBoardPriceSpread: (exchangeBoardCode: string, exchangeBoardPriceSpreadCode: string) => ?ExchangeBoardPriceSpread,
    getOrderTypes: () => OrderType[],
}

export type LanguageContextType = {
    language: Language,
    selectLanguage: (Language) => void
}

export type NavigationContextType = {
    processingOrder: ?Order,
    navigateToOrderAmendForm: (instrument: Instrument, order: Order) => void,
    navigateToOrderCancelForm: (instrument: Instrument, order: Order) => void,
    navigateToOrderInputForm: (orderInputRequest: ?OrderInputRequest) => void
}

export type AccountContextType = {
    availableTradingAccount: Array<SimpleTradingAccount>,
    selectTradingAccount: (SimpleTradingAccount: SimpleTradingAccount) => void,
    selectedTradingAccount: () => ?SimpleTradingAccount    
}

export type SessionContextType = {
    cacheContext: CacheContextType,
    languageContext: LanguageContextType,
    navigationContext: NavigationContextType,
    accountContext: AccountContextType
}

export const SessionContext = React.createContext({
    cacheContext: {
        getCurrency: (currencyCode: string) => null,
        getCurrencies: () => [],
        getExchangeBoardPriceSpread: (exchangeBoardCode: string, exchangeBoardPriceSpreadCode: string) => null,
        getOrderTypes: () => [],
    },
    languageContext: {
        language: Language.English,
        selectLanguage: (language: Language) => {},    
    },
    navigationContext: {
        processingOrder: null,
        navigateToOrderAmendForm: (instrument: Instrument, order: Order) => { },
        navigateToOrderCancelForm: (instrument: Instrument, order: Order) => { },
        navigateToOrderInputForm: (orderInputRequest: ?OrderInputRequest) => { }
    },    
    accountContext: {
        availableTradingAccount: [],
        selectTradingAccount: (SimpleTradingAccount: SimpleTradingAccount) => {},
        selectedTradingAccount: () => null    
    }
});
