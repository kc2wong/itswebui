// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { XcButton, XcCheckbox, XcForm, XcFormGroup, XcInputText, XcSelect } from 'shared/component';
import { XcOption } from 'shared/component';
import { Mode } from 'shared/model/EnumType'
import { xlate } from 'shared/util/lang'
import { XcInputTextConstraint, XcSelectConstraint } from 'shared/component/validation/XcFieldConstraint';
import { FunctionCategory, StmAction, StmActionType } from 'app/model/staticdata';

type Props = {
    mode: Mode,
    model: Object,
    onModelUpdate?: (model: Object) => void,    
}

type State = {

}

export class StmActionEditForm extends Component<Props, State> {

    render() {
        const { mode, model, onModelUpdate } = this.props;
        const functionCategoryOpt = _.map(FunctionCategory.enumValues, (i) => {
            return new XcOption(`${i.value}`, xlate(`enum.functionCategory.${i.value}`))
        })
        const stmActionTypeOpt = _.map(StmActionType.enumValues, (i) => {
            return new XcOption(`${i.value}`, xlate(`enum.stmActionType.${i.value}`))
        })
        const readonly = mode == Mode.View
        const keyFieldReadonly = readonly && mode != Mode.New

        return (
            <XcForm name="stmActionEditForm" model={model} onModelUpdate={onModelUpdate} >
                <XcFormGroup>
                    <XcInputText name="stmActionCode" readonly={keyFieldReadonly} validation={new XcInputTextConstraint(true)} width={3} />
                </XcFormGroup>                
                <XcFormGroup>
                    <XcInputText name="descpt" readonly={readonly} validation={new XcInputTextConstraint(true)} width={6} />
                </XcFormGroup>
                <XcFormGroup>
                    <XcSelect name="functionCategory" options={functionCategoryOpt} readonly={readonly} validation={new XcSelectConstraint(true)} width={3} />
                </XcFormGroup>
                <XcFormGroup>
                    <XcSelect name="stmActionType" options={stmActionTypeOpt} readonly={readonly} validation={new XcSelectConstraint(true)} width={3} />
                </XcFormGroup>                
            </XcForm>
        )
    }
}
