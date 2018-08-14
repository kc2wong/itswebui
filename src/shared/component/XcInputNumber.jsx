// @flow
import React, { Component } from 'react';
// import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import { Button, Form, Input, Label } from 'semantic-ui-react';
import FormContext from './XcForm';
import FormGroupContext from './XcFormGroup';
import { constructLabel, createColumnClass, getRequired, getStringValue } from './XcFormUtil';
import { IFieldConstraint, XcInputTextConstraint } from './validation/XcFieldConstraint';
import type { XcIconProps } from './XcIconProps';
import { parseBool, xlate } from 'shared/util/lang';

import './XcInputText.css';

type Props = {
    icon: ?XcIconProps,
    label?: string,
    name: string,
    placeholder: ?string,
    prefix: ?string,
    prefixMinWidth: ?string,
    readonly: ?bool,
    steppingDown: ?number,
    steppingUp: ?number,
    subLabel: ?string,
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
        return (
            <FormContext.Consumer>
                {formCtx =>
                    <FormGroupContext.Consumer>
                        {formGrpCtx =>
                            this.constructInputField(formCtx, formGrpCtx)
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

    handleStepUp = (formCtx: any) => (event: SyntheticInputEvent<>) => {
        console.log("handleStepUp.....")
        const { steppingUp, value } = this.props
        if (steppingUp) {
            if (value) {
                // should be calling onChange as it is controlled component
                formCtx.updateModel(this.props.name, parseFloat(value) + steppingUp);
            }
            else {
                formCtx.patchModel(this.props.name, steppingUp);
            }
        }
    }

    handleStepDown = (formCtx: any) => (event: SyntheticInputEvent<>) => {
        console.log("handleStepDown.....")
        const { steppingDown, value } = this.props
        if (steppingDown) {
            if (value) {
                formCtx.updateModel(this.props.name, parseFloat(value) - steppingDown);
            }
            else {
                // should be calling onChange as it is controlled component
                formCtx.patchModel(this.props.name, -steppingDown);
            }
        }
    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.debug(`XcInputText.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`);
        updateModel(this.props.name, event.target.value);
    }

    constructInputField = (formCtx: any, formGrpCtx: any) => {
        const { icon, label, name, placeholder, prefix, prefixMinWidth, readonly, steppingDown, steppingUp, subLabel, validation, value, width, ...props } = this.props;
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = icon != null ? { icon: icon.name, iconPosition: "left" } : {};
        const c = createColumnClass(width) + " " + (getRequired(validation) ? "required" : "")
        const r = parseBool(readonly, false) ? { readOnly: true } : {}
        const l = prefix != null ? { label: prefix } : {}
        const float = subLabel ? { style: { float: "left" } } : {}

        if (steppingUp != null || steppingDown != null) {
            return (
                <Form.Field required={getRequired(validation)}>
                    <label {...float}>{constructLabel(formCtx.name, name, label)}</label>
                    {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                    <Input
                        action
                        className={prefix != null ? "labeled" : ""}
                        type="text"
                        {...i}
                        // {...l}
                        {...ph}
                        {...r}
                        {... (formGrpCtx && formGrpCtx.fluid) ? { fluid: true } : { width: width }}>
                        {prefix != null && (<Label {... prefixMinWidth ? {style: {minWidth: prefixMinWidth}} : {} }>{prefix}</Label>)}
                        <input onChange={this.handleChange(formCtx.updateModel)} type="text" value={getStringValue(value, formCtx.model, name)} />
                        <Button disabled={steppingUp == 0} icon="plus" onClick={this.handleStepUp(formCtx)} />
                        <Button disabled={steppingDown == 0} icon="minus" onClick={this.handleStepDown(formCtx)} />
                    </Input>
                </Form.Field>
            )
        }
        else {
            return (
                <Form.Field required={getRequired(validation)}>
                    <label {...float}>{constructLabel(formCtx.name, name, label)}</label>
                    {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                    <Input
                        type="text"
                        onChange={this.handleChange(formCtx.updateModel)}
                        value={getStringValue(value, formCtx.model, name)}
                        {...i}
                        {...l}
                        {...ph}
                        {...r}
                        {... (formGrpCtx && formGrpCtx.fluid) ? { fluid: true } : { width: width }}>
                        {/* {prefix && (<Label>{prefix}</Label>)} */}
                    </Input>
                </Form.Field>
            )
        }
    }

}
