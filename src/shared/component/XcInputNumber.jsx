// @flow
import React, { Component } from 'react';
import { Enum } from 'enumify'
import { Button, Form, Input, Label, Popup } from 'semantic-ui-react';
import FormContext from './XcForm';
import FormGroupContext from './XcFormGroup';
import { constructLabel, createColumnClass, createFormContextComponent, getFormContext, getRequired, getNumberValue, getStringValue } from './XcFormUtil';
import { ValidationStatus } from './validation/XaValidationStatus'
import { IFieldConstraint, XaInputNumberConstraint } from './validation/XcFieldConstraint';
import type { XcIconProps } from './XcIconProps';
import { addFloat, parseBool, subtractFloat, xlate } from 'shared/util/lang'
import { ErrorCode } from 'shared/constant/ErrorCode'
import { isNullOrEmpty } from 'shared/util/stringUtil'

import './XcInputText.css';

export class NumberType extends Enum { }
NumberType.initEnum(['Integer', 'Decimal']);

type Props = {
    disabled: ?boolean,
    icon: ?XcIconProps,
    label?: string,
    name: string,
    onChange?: (event: SyntheticInputEvent<>, value: number) => void,
    placeholder: ?string,
    prefix: ?string,
    prefixMinWidth: ?string,
    readonly: ?bool,
    steppingDown: ?number,
    steppingUp: ?number,
    subLabel: ?string,
    type: ?NumberType,
    value: ?number,
    validation: ?XaInputNumberConstraint,
    width: ?number
}

type State = {
    errorMessage: ?string,
    inFocus: boolean,
    intermediate: string,
    validationStatus: ValidationStatus
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
            errorMessage: null,            
            inFocus: false,
            intermediate: '',
            validationStatus: ValidationStatus.NotValidate
        }
    }

    componentDidMount() {
        getFormContext(this.props).attach(this)
    }

    render() {
        const formCtx = getFormContext(this.props)

        return (
            <FormGroupContext.Consumer>
                {formGrpCtx =>
                    this.constructInputField(formCtx, formGrpCtx)
                }
            </FormGroupContext.Consumer>
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
        const { onChange, steppingUp, value } = this.props
        if (steppingUp) {
            if (value) {
                if (onChange) {
                    onChange(addFloat(value, steppingUp), event)
                }
            }
            else {
                formCtx.patchModel(this.props.name, steppingUp);
            }
        }
    }

    handleStepDown = (formCtx: any) => (event: SyntheticEvent<>) => {
        console.log("handleStepDown.....")
        const { onChange, steppingDown, value } = this.props

        if (steppingDown) {
            if (value) {
                if (onChange) {
                    onChange(subtractFloat(value, steppingDown), event)
                }
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
            this.setState({ errorMessage: null, intermediate: v, validationStatus: ValidationStatus.NotValidate }, () => {                
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
        const formName = formCtx.name

        const { disabled, icon, label, name, onChange, placeholder, prefix, prefixMinWidth, readonly, steppingDown, steppingUp, subLabel, validation, value, width, ...props } = this.props;
        const { errorMessage, inFocus, intermediate, validationStatus } = this.state
        const e = validationStatus == ValidationStatus.ValidateFail ? { error: true } : {}
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = icon != null ? { icon: icon.name, iconPosition: "left" } : {};
        const c = createColumnClass(width) + " " + (getRequired(validation) ? "required" : "")
        const r = parseBool(readonly, false) ? { readOnly: true } : {}
        const l = prefix != null ? { label: prefix } : {}
        const float = subLabel ? { style: { float: "left" } } : {}
        const v = inFocus ? intermediate : this.getInputNumber(value, model, name)

        const caption = constructLabel(formName, name, label)
        const fieldLabel = validationStatus == ValidationStatus.ValidateFail ?
            <Popup trigger={<label {...float}>{caption}</label>} content={errorMessage} />
            :
            <label {...float}>{caption}</label>
        const fieldDisabled = parseBool(disabled, false)

        if (steppingUp != null || steppingDown != null) {
            return (
                <Form.Field required={getRequired(validation)} {...e}>
                    {fieldLabel}
                    {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                    <Input
                        action
                        className={prefix != null ? "labeled" : ""}
                        disabled={fieldDisabled}
                        onBlur={this.handleOnBlur(formCtx.updateModel)}
                        onFocus={this.handleOnFocus(v)}
                        type="text"
                        {...i}
                        {...ph}
                        {...r}
                        {... (formGrpCtx && formGrpCtx.fluid) ? { fluid: true } : { width: width }}>
                        {prefix != null && (<Label {...prefixMinWidth ? { style: { minWidth: prefixMinWidth } } : {}}>{prefix}</Label>)}
                        <input onChange={this.handleChange(formCtx.updateModel)} type="text" value={v} />
                        <Button disabled={fieldDisabled || steppingUp == 0} icon="plus" onClick={this.handleStepUp(formCtx)} />
                        <Button disabled={fieldDisabled || steppingDown == 0} icon="minus" onClick={this.handleStepDown(formCtx)} />
                    </Input>
                </Form.Field>
            )
        }
        else {
            return (
                <Form.Field required={getRequired(validation)} {...e}>
                    {fieldLabel}
                    {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                    <Input
                        disabled={fieldDisabled}
                        onBlur={this.handleOnBlur(formCtx.updateModel)}
                        onFocus={this.handleOnFocus(v)}
                        onChange={this.handleChange(formCtx.updateModel)}
                        type="text"
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

    /**
     * API called by container form
     */
    validate(model: Object, formName: string) : Promise<ValidationStatus> {
        const { label, name, type, validation, value } = this.props;
        let errorMessage: ?string = null
        let validationStatus = ValidationStatus.ValidateSuccess

        const v = getStringValue(value, model, name)
        if (getRequired(validation)) {
            if (isNullOrEmpty(v)) {
                errorMessage =  xlate(`error.${ErrorCode.MISSING_MANDATORY_FIELD}`, [constructLabel(formName, name, label)])
            }
        }

        const numericValue = getNumberValue(value, model, name)
        if (numericValue != null && validation != null) {
            // if (parseBool(validation.positive, false) && numericValue <= 0) {
            //     errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_POSITIVE}`, [constructLabel(formName, name, label)])
            // }
            // if (parseBool(validation.nonNegative, false) && numericValue < 0) {
            //     errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_NON_NEGATIVE}`, [constructLabel(formName, name, label)])
            // }
            // if (parseBool(validation.negative, false) && numericValue >= 0) {
            //     errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_NEGATIVE}`, [constructLabel(formName, name, label)])
            // }
            // if (parseBool(validation.nonPositive, false) && numericValue <= 0) {
            //     errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_NON_POSITIVE}`, [constructLabel(formName, name, label)])
            // }
            if (errorMessage == null && validation.lessThan != null && !(numericValue < validation.lessThan)) {
                errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_LESS_THAN}`, [constructLabel(formName, name, label), validation.lessThan])
            }
            if (errorMessage == null && validation.lessEqual != null && !(numericValue <= validation.lessEqual)) {
                errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_LESS_EQUAL}`, [constructLabel(formName, name, label), validation.lessEqual])
            }
            if (errorMessage == null && validation.greaterThan != null && !(numericValue > validation.greaterThan)) {
                errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_GREATER_THAN}`, [constructLabel(formName, name, label), validation.greaterThan])
            }
            if (errorMessage == null && validation.greaterEqual != null && !(numericValue >= validation.greaterEqual)) {
                errorMessage =  xlate(`error.${ErrorCode.NUMBER_MUST_BE_GREATER_EQUAL}`, [constructLabel(formName, name, label), validation.greaterEqual])
            }
            if (errorMessage == null && validation.custom != null) {
                errorMessage = validation.custom()              
            }
        }

        if (errorMessage != null) {
            validationStatus = ValidationStatus.ValidateFail
        }
        this.setState({ errorMessage: errorMessage, validationStatus: validationStatus })
        return Promise.resolve(validationStatus)
    }

    reset() {
        this.setState({ errorMessage: null, validationStatus: ValidationStatus.NotValidate })
    }

}

export const XaInputNumber = createFormContextComponent(XcInputNumber);
