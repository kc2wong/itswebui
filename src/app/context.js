// @flow
import _ from 'lodash';
import React from 'react';
import { Language, xlate } from 'shared/util/lang';
import { MessageService } from 'shared/service';
import { XcDialog } from 'shared/component';
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'
import { Currency } from 'app/model/staticdata'

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
    getCurrency: (currencyCode: string) => ?Currency
}

export type LanguageContextType = {
    language: Language,
    selectLanguage: (Language) => void
}

export type AccountContextType = {
    availableTradingAccount: Array<SimpleTradingAccount>,
    selectTradingAccount: (SimpleTradingAccount: SimpleTradingAccount) => void,
    gelectTradingAccount: () => ?SimpleTradingAccount    
}

export type SessionContextType = {
    cacheContext: CacheContextType,
    languageContext: LanguageContextType,
    accountContext: AccountContextType
}

export const SessionContext = React.createContext({
    cacheContext: {
        getCurrency: (currencyCode: string) => null
    },
    languageContext: {
        language: Language.English,
        selectLanguage: (language: Language) => {},    
    },
    accountContext: {
        availableTradingAccount: [],
        selectTradingAccount: (SimpleTradingAccount: SimpleTradingAccount) => {},
        gelectTradingAccount: () => null    
    }
});
