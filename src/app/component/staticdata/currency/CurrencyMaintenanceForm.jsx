
// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { Mode, PageResult, SortOrder } from 'shared/model';
import { ButtonVisibility, XcDialog, XcDivider } from 'shared/component';
import { xlate } from 'shared/util/lang';
import { Pageable } from 'shared/model/BaseModel';
import { Toolbar } from 'app/component/common/Toolbar';
import { CurrencyEditForm } from './CurrencyEditForm';
import { CurrencyEnquiryForm } from './CurrencyEnquiryForm';
import { Currency } from 'app/model/staticdata';
import { currencyService } from 'app/service/staticdata/CurrencyService';
import { MessageContext, MessageService } from 'shared/service';

import 'assets/styles/itsweb.css';

type Props = {
    messageService?: MessageService
}

type State = {
    mode: Mode,
    searchResult: ?PageResult<Currency>,
    selectedIndex: number,
    workingRecord: ?Object
}

const style = { maxWidth: 1920, minWidth: 1080, width: "60vw" }
class CurrencyMaintenanceForm extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = this.defaultState()
    }

    render() {
        const { mode, searchResult, selectedIndex, workingRecord } = this.state;
        const selectedRecord = (searchResult && selectedIndex != -1) ? searchResult.data[selectedIndex].toJson() : {} 
        const verboseMode = xlate(`general.${mode.value}`);

        const backButtonVisibility = mode == Mode.Enquiry ? ButtonVisibility.Hidden : ButtonVisibility.Enable
        const deleteButtonVisibility = mode == Mode.Enquiry ? ButtonVisibility.Hidden : (mode == Mode.Edit ? ButtonVisibility.Enable : ButtonVisibility.Hidden)
        const editButtonVisibility = mode == Mode.Enquiry ? (searchResult ? (selectedIndex != -1 ? ButtonVisibility.Enable : ButtonVisibility.Disable) : ButtonVisibility.Hidden) : ButtonVisibility.Hidden
        const newButtonVisibility = mode == Mode.Enquiry ? ButtonVisibility.Enable : ButtonVisibility.Hidden
        const refreshButtonVisibility = mode == Mode.Enquiry ? ButtonVisibility.Hidden : ButtonVisibility.Enable
        const saveButtonVisibility = (mode == Mode.Enquiry || mode == Mode.View) ? ButtonVisibility.Hidden : (!_.isEqual(workingRecord, selectedRecord) ? ButtonVisibility.Enable : ButtonVisibility.Disable)
        const viewButtonVisibility = mode == Mode.Enquiry ? (searchResult ? (selectedIndex != -1 ? ButtonVisibility.Enable : ButtonVisibility.Disable) : ButtonVisibility.Hidden) : ButtonVisibility.Hidden

        return (
            <React.Fragment>
                <Toolbar title={xlate("currencyMaintenanceForm.title", [verboseMode])}
                    backButtonAction={this.handleBack} backButtonVisibility={backButtonVisibility}
                    deleteButtonAction={this.handleDeleteRecord} deleteButtonVisibility={deleteButtonVisibility}
                    editButtonAction={this.handleEditRecord} editButtonVisibility={editButtonVisibility}
                    newButtonAction={this.handleNewRecord} newButtonVisibility={newButtonVisibility}
                    refreshButtonAction={this.handleRefreshRecord} refreshButtonVisibility={refreshButtonVisibility}
                    saveButtonAction={this.handleSaveRecord} saveButtonVisibility={saveButtonVisibility}
                    viewButtonAction={this.handleViewRecord} viewButtonVisibility={viewButtonVisibility}
                    style={style}
                />
                <div className="its-vscrollable-flex-content">
                    <div style={style}>
                        {mode === Mode.Enquiry ?
                            <CurrencyEnquiryForm onClear={this.handleClear} onSearch={this.handleSearchRecord} onRecordSelect={this.handleSelectRecord} selectedIndex={selectedIndex} searchResult={searchResult} /> :
                            <CurrencyEditForm model={workingRecord ? workingRecord : {}} onModelUpdate={this.handleModelUpdate} />
                        }
                    </div>
                </div>
            </React.Fragment>
        )
    }

    handleBack = () => {
        this.setState({ mode: Mode.Enquiry })
    }

    handleClear = () => {
        this.setState(this.defaultState())
    }

    handleCloseDialog = () => {
        const { messageService } = this.props;
        messageService && messageService.hideDialog();
    }

    handleDeleteRecord = () => {
    }

    handleEditRecord = () => {
        this.handleGetOneRecord(Mode.Edit)
    }

    handleModelUpdate = (model: Object) => {
        this.setState({ workingRecord: model })
    }

    handleNewRecord = () => {
        const newRecord = Currency.newInstance().toJson(); 
        this.setState({ mode: Mode.New, selectedIndex: -1, workingRecord: newRecord })
    }

    handleRefreshRecord = () => {
        const { messageService } = this.props;
        const { searchResult, selectedIndex, workingRecord } = this.state;
        const selectedRecord = (searchResult && selectedIndex != -1) ? searchResult.data[selectedIndex].toJson() : {} 

        if (!_.isEqual(selectedRecord, workingRecord)) {
            const dialog = <XcDialog confirmYesAction={this.handleGetOneRecord}
                confirmNoAction={this.handleCloseDialog}
                message={xlate('general.discardChangeQuestion')}
                type={XcDialog.Type.YesNo} />
            messageService && messageService.showDialog(dialog);
        }
        else {
            this.handleGetOneRecord()
        }
    }

    handleSaveRecord = () => {
        const { messageService } = this.props;
        const dialog = <XcDialog confirmYesAction={this.handleCloseDialog}
            confirmNoAction={this.handleCloseDialog}
            message={xlate('general.saveChangeQuestion')}
            type={XcDialog.Type.YesNo} />
        
        messageService && messageService.showDialog(dialog);
    }

    handleSearchRecord = (searchCriteria: Object, pageable: ?Pageable, reverseOnly: ?bool = false): ?Promise<PageResult<Currency>> => {
        const { messageService } = this.props
        const { searchResult } = this.state

        messageService && messageService.showLoading()
        if (reverseOnly) {
            if (searchResult) {
                const result = new PageResult(
                    searchResult.criteria, searchResult.currentPage, searchResult.pageSize, searchResult.totalPage, searchResult.totalCount,
                    _.reverse(searchResult.data)
                )
                messageService && messageService.hideLoading()
                this.setState({ searchResult: result })                
                return Promise.resolve(result)
            }
        }
        else {
            return currencyService.getPage(pageable, {}, new Map()).then(
                result => {
                    messageService && messageService.hideLoading()
                    this.setState({ searchResult: result })
                    return Promise.resolve(result)
                },
                error => {
                    messageService && messageService.hideLoading()
                    return Promise.reject(error)
                }
            )    
        }
    }

    handleSelectRecord = (currency: Currency) => {
        const { searchResult } = this.state
        const id = currency.getId()
        const selectedIndex = (currency && searchResult) ? _.findIndex(searchResult.data, (v) => { return _.isEqual(v.getId(), id)}) : -1;
        this.setState({ selectedIndex: selectedIndex, workingRecord: currency.toJson() })
    }

    handleViewRecord = () => {
        this.handleGetOneRecord(Mode.View)
    }

    handleGetOneRecord = (newMode: ?Mode) => {
        const { messageService } = this.props;
        const { mode, searchResult, selectedIndex } = this.state;
        const selectedRecord = (searchResult && selectedIndex != -1) ? searchResult.data[selectedIndex] : null 

        if (selectedRecord != null) {
            messageService && messageService.showLoading()
            currencyService.getOne(selectedRecord.getId()).then(
                result => {
                    messageService && messageService.hideLoading()
                    // this.setState({ mode: (newMode != null ? newMode : mode), selectedRecord: result, workingRecord: result }, () => {
                    this.setState({ mode: (newMode != null ? newMode : mode), workingRecord: result.toJson() }, () => {
                        if (messageService && messageService.isDialogShowing()) {
                            messageService.hideDialog()
                        }
                    })
                }
            )
        }
        else {
            console.warn('CurrencyMaintenanceForm.handleReGetOneRecord()...no record is selected')
        }
    }

    defaultState = (): Object => {
        return {
            searchResult: null,
            selectedRecord: null,
            selectedIndex: -1,
            workingRecord: null,
            mode: Mode.Enquiry    
        }
    }
}

export default (props: Props) => (
    <MessageContext.Consumer>
        {messageService => <CurrencyMaintenanceForm {...props} messageService={messageService} />}
    </MessageContext.Consumer>
);