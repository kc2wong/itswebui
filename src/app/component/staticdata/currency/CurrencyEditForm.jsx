// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { XcButton, XcCheckbox, XcForm, XcFormGroup, XcInputText, XcSelect } from 'shared/component';
import { XcOption } from 'shared/component';
import { XcInputTextConstraint, XcSelectConstraint } from 'shared/component/validation/XcFieldConstraint';
import { Currency } from 'app/model/staticdata';

type Props = {
    model: Object,
    onModelUpdate?: (model: Object) => void,    
}

type State = {

}

export class CurrencyEditForm extends Component<Props, State> {

    render() {
        const { model, onModelUpdate } = this.props;
        const dpOpt = _.map(_.range(4), (i) => {
            return new XcOption(`${i}`, `${i}`)
        });
        return (
            <XcForm name="currencyEditForm" model={model} onModelUpdate={onModelUpdate} >
                <XcFormGroup>
                    <XcInputText name="currencyCode" validation={new XcInputTextConstraint(true)} readonly={model.currencyOid.length > 0} width={3} />
                </XcFormGroup>                
                <XcFormGroup>
                    <XcInputText name="descptDefLang" validation={new XcInputTextConstraint(true)} width={6} />
                </XcFormGroup>
                <XcFormGroup>
                    <XcInputText name="isoCode" width={3} />
                    <XcSelect name="decimalPoint" numeric options={dpOpt} validation={new XcSelectConstraint(true)} width={3} />
                </XcFormGroup>
                <XcFormGroup>
                    <XcInputText name="unitName" width={3} />
                    <XcInputText name="subUnitName" width={3} />
                </XcFormGroup>                
            </XcForm>
        )
    }
}
