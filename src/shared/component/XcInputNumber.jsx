// @flow
import React, { Component } from 'react';
// import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import { Button, Form, Input } from 'semantic-ui-react';
import FormContext from './XcForm';
import FormGroupContext from './XcFormGroup';
import { constructLabel, createColumnClass, getRequired, getStringValue } from './XcFormUtil';
import { IFieldConstraint, XcInputTextConstraint } from './validation/XcFieldConstraint';
import type { XcIconProps } from './XcIconProps';
import { parseBool, xlate } from 'shared/util/lang';

import './XcInputText.css';

type Props = {
    icon: ?XcIconProps,
    label? :string,
    name: string,
    placeholder: ?string,
    prefix: ?string,
    readonly: ?bool,
    stepping: ?number,
    value: ?string,
    validation: ?XcInputTextConstraint,
    width: ?number
}

type State = {
}

export class XcInputNumber extends Component<Props, State> {

    static defaultProps = {
        width: 12
    };

    render() {
        const { icon, label, name, placeholder, prefix, readonly, stepping, validation, value, width, ...props } = this.props;
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = icon != null ? { icon: icon.name, iconPosition: "left" } : {};
        const c = createColumnClass(width) + " " + (getRequired(validation)  ? "required" : "")
        const r = parseBool(readonly, false) ? { readOnly: true } : {}
        const l = prefix ? {label: prefix} : {}

        return (
            <FormContext.Consumer>
                {formCtx =>
                    <FormGroupContext.Consumer>
                        {formGrpCtx =>
                            <Form.Field required={getRequired(validation)}>
                                <label>{constructLabel(formCtx.name, name, label)}</label>
                                <Input
                                    action={stepping != null}
                                    onChange={this.handleChange(formCtx.updateModel)}                                    
                                    type="text"
                                    value={getStringValue(value, formCtx.model, name)}
                                    {...i}
                                    {...l}
                                    {...ph}
                                    {...r}
                                    {... (formCtx != null && formGrpCtx.fluid) ? { fluid: true } : { width: width }}>
                                    {stepping && (
                                        <React.Fragment>
                                            <input />
                                            <Button icon="plus" onClick={this.handleStepUp(formCtx.updateModel)} />
                                            <Button icon="minus"  onClick={this.handleStepDown(formCtx.updateModel)} />
                                        </React.Fragment>
                                    )}
                                </Input>                                    
                            </Form.Field>
                        }
                    </FormGroupContext.Consumer>
                }
            </FormContext.Consumer>
        )
    }

    handleMouseOver = (event: any) => {
        console.log("handleMouseOver.....")
    }

    handleClick = (event: SyntheticMouseEvent<>) => {
        console.log("handleClick.....")
    }

    handleStepUp = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.log("handleStepUp.....")
        const { stepping, value } = this.props
        if (stepping) {
            updateModel(this.props.name, value ? parseFloat(value) + stepping : stepping);
        }
    }

    handleStepDown = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.log("handleStepDown.....")
        const { stepping, value } = this.props
        if (stepping) {
            updateModel(this.props.name, value ? parseFloat(value) - stepping : - stepping);
        }
    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.debug(`XcInputText.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`);
        updateModel(this.props.name, event.target.value);
    }       
     
}
