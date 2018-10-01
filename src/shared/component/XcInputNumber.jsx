// @flow
import React, { Component } from 'react';
import { Enum } from 'enumify'
import { Button, Form, Input, Label } from 'semantic-ui-react';
import FormContext from './XcForm';
import FormGroupContext from './XcFormGroup';
import { constructLabel, createColumnClass, getRequired, getStringValue } from './XcFormUtil';
import { IFieldConstraint, XcInputTextConstraint } from './validation/XcFieldConstraint';
import type { XcIconProps } from './XcIconProps';
import { parseBool, xlate } from 'shared/util/lang';

import './XcInputText.css';

export class NumberType extends Enum { }
NumberType.initEnum(['Integer', 'Decimal']);

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
    type: ?NumberType,
    value: ?number,
    validation: ?XcInputTextConstraint,
    width: ?number
}

type State = {
    inFocus: boolean,
    intermediate: string
}

export class XcInputNumber extends Component<Props, State> {
    static Type = NumberType

    static defaultProps = {
        width: 12
    };

    constructor(props: Props) {
        super();
        this.props = props;
        this.state = {
            inFocus: false,
            intermediate: ''
        }
    }

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

    handleClick = (event: SyntheticMouseEvent<>) => {
        console.log("handleClick.....")
    }

    handleOnBlur = (updateModel: any) => (event: SyntheticFocusEvent<>) => {
        this.setState({ inFocus: false })
    }

    handleOnFocus = (value: string) => (event: SyntheticFocusEvent<>) => {
        this.setState({ inFocus: true, intermediate: value })
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
        console.debug(`XcInputNumber.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`);
        const { name, type } = this.props
        const isInteger = type == null || type == NumberType.Integer
        const v: string = event.target.value
        const length = v.length

        // updateModel(this.props.name, event.target.value);
        const regexp = isInteger ?  /^(?:[-]?(?:\d+))?$/ : /^(?:[-]?(?:\d+))?(?:\.\d*)?$/
        let validateOk = true

        if (length > 0) {
            if (!regexp.test(v)) {
                // input must be number
                validateOk = false
            }
        }

        if (validateOk) {
            this.setState({ intermediate: v }, () => {                
                updateModel(name, length == 0 ? null : (isInteger ? Number.parseInt(v) : Number.parseFloat(v)));
            })
        }
        else {
            event.preventDefault()
        }


    }

    getInputNumber(value: ?number, model: ?Object, name: string): string {
        var rtn = null
        if (value != null) {
            rtn = value
        }
        else if (model != null) {
            rtn = (model[name]: number)
        }
        return rtn != null ? rtn.toString() : ""
    }

    constructInputField = (formCtx: any, formGrpCtx: any) => {
        const model = formCtx.model
        const { icon, label, name, placeholder, prefix, prefixMinWidth, readonly, steppingDown, steppingUp, subLabel, validation, value, width, ...props } = this.props;
        const { inFocus, intermediate } = this.state
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = icon != null ? { icon: icon.name, iconPosition: "left" } : {};
        const c = createColumnClass(width) + " " + (getRequired(validation) ? "required" : "")
        const r = parseBool(readonly, false) ? { readOnly: true } : {}
        const l = prefix != null ? { label: prefix } : {}
        const float = subLabel ? { style: { float: "left" } } : {}
        const v = inFocus ? intermediate : this.getInputNumber(value, model, name)

        if (steppingUp != null || steppingDown != null) {
            return (
                <Form.Field required={getRequired(validation)}>
                    <label {...float}>{constructLabel(formCtx.name, name, label)}</label>
                    {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                    <Input
                        action
                        className={prefix != null ? "labeled" : ""}
                        onBlur={this.handleOnBlur(formCtx.updateModel)}
                        onFocus={this.handleOnFocus(v)}
                        type="text"
                        {...i}
                        {...ph}
                        {...r}
                        {... (formGrpCtx && formGrpCtx.fluid) ? { fluid: true } : { width: width }}>
                        {prefix != null && (<Label {...prefixMinWidth ? { style: { minWidth: prefixMinWidth } } : {}}>{prefix}</Label>)}
                        <input onChange={this.handleChange(formCtx.updateModel)} type="text" value={v} />
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
                        onBlur={this.handleOnBlur(formCtx.updateModel)}
                        onFocus={this.handleOnFocus(v)}
                        onChange={this.handleChange(formCtx.updateModel)}
                        value={v}
                        {...i}
                        {...l}
                        {...ph}
                        {...r}
                        {... (formGrpCtx && formGrpCtx.fluid) ? { fluid: true } : { width: width }}>
                    </Input>
                </Form.Field>
            )
        }
    }

}
