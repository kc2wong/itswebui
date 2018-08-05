// @flow
import * as React from 'react';
import { XcDialog } from 'shared/component/XcDialog'

export type MessageService = {
    hideLoading: () => void,
    showLoading: () => void,
    hideDialog: () => void,
    showDialog: (dialog: XcDialog) => void,
    isDialogShowing: () => bool,
}

const defaultMessageService: MessageService = {
    hideLoading: () => {},
    showLoading: () => {},
    hideDialog: () => {},
    showDialog: (dialog: XcDialog) => {},
    isDialogShowing: () => {return false}
}; 

export const MessageContext = React.createContext(defaultMessageService);