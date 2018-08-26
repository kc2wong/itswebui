// @flow
import _ from 'lodash';
import React from 'react';
import { Language, xlate } from 'shared/util/lang';
import { MessageService } from 'shared/service';
import { XcDialog } from 'shared/component';
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'

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
    languageContext: LanguageContextType,
    accountContext: AccountContextType
}

export const SessionContext = React.createContext({
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
