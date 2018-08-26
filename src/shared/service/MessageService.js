// @flow
import * as React from 'react';
import { XcDialog } from 'shared/component/XcDialog'

export type MessageService = {
    hideLoading: () => void,
    showLoading: () => void,
    dismissDialog: () => void,
    showDialog: (dialog: XcDialog) => void,
    isDialogShowing: () => bool,
}
