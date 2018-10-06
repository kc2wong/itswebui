// @flow
import React, { Component } from 'react';
import { Enum } from 'enumify';
import { Form, Icon, Input, Popup } from 'semantic-ui-react';
import FormContext from './XcForm';
import type { FormContextType } from './XcForm'
import FormGroupContext from './XcFormGroup';
import { constructLabel, createColumnClass, getFormContext, getRequired, getStringValue } from './XcFormUtil';
import { ValidationStatus } from './validation/XaValidationStatus'
import type { XcInputTextConstraint } from './validation/XcFieldConstraint'
import type { XcIconProps } from './XcIconProps'
import { IconPosition } from './XcIconProps'
import { parseBool, xlate } from 'shared/util/lang'
import { isNullOrEmpty } from 'shared/util/stringUtil'

import './XcInputText.css';

type Props = {
    formatter?: (value: string) => string, 
    icon?: XcIconProps,
    inline?: bool,
    label?: string,
    loading?: bool,
    lookup?: () => Promise<ValidationStatus>,
    name: string,
    onBlur?: (event: SyntheticFocusEvent<>) => void,
    password?: bool,
    placeholder?: string,
    readonly?: bool,
    subLabel?: string,
    value?: string,
    validation?: XcInputTextConstraint,
    width?: number
}

type State = {
    errorMessage: ?string,
    inFocus: boolean,
    mouseOverIcon: boolean,
    validationStatus: ValidationStatus
}

export class XcInputText extends Component<Props, State> {
    
    static defaultProps = {
        width: 16
    };

    constructor(props: Props) {
        super();
        this.state = { inFocus: false, mouseOverIcon: false, errorMessage: null, validationStatus: ValidationStatus.NotValidate }
    }
    
    componentDidMount() {
        getFormContext(this.props).attach(this)
    }

    render() {
        const formCtx = getFormContext(this.props)
        const formName = formCtx.name

        const { icon, inline, formatter, label, loading, name, onBlur, password, placeholder, readonly, subLabel, validation, value, width, ...props } = this.props;
        const isPassword = parseBool(password, false)
        const { errorMessage, inFocus, mouseOverIcon, validationStatus } = this.state
        const e = validationStatus == ValidationStatus.ValidateFail ? { error: true } : {}
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = icon != null ? { icon: <Icon name={icon.name} onMouseOut={this.handleIconMouseOut} onMouseEnter={this.handleIconMouseOver}  link={isPassword || icon.onIconClick != null} onClick={icon.onIconClick} /> } : {};
        const ip = (icon != null && (icon.position == null || icon.position == IconPosition.Left)) ? { iconPosition: IconPosition.Left.value } : {}         // no need to specify position when it is right 
        const l = parseBool(loading, false) ? { loading: true } : {}
        const ml = (validation != null && validation.maxLength != null) ? { maxLength: validation.maxLength }: {}
        const t = Object.assign({}, isPassword && !mouseOverIcon ? { type: 'password' } : { type: 'text' }, props)
        const ro = parseBool(readonly, false) ? { readOnly: true } : {}
        const float = subLabel ? { style: { float: "left" } } : {}
        const w = width != null ? { width: width } : {}
        const v = (!inFocus && formatter != null) ? formatter(getStringValue(value, formCtx.model, name)) : getStringValue(value, formCtx.model, name)

        const caption = constructLabel(formName, name, label)
        const fieldLabel = validationStatus == ValidationStatus.ValidateFail ?
            formName == "" ? <Popup trigger={<div>{caption}</div>} content={errorMessage} /> : <Popup trigger={<label {...float}>{caption}</label>} content={errorMessage} />
            :
            formName == "" ? <div>{caption}</div> : <label {...float}>{caption}</label>            

        return (
            <FormGroupContext.Consumer>
                {formGrpCtx =>
                    formName == "" ?
                        <div className="xa-inline-input">{fieldLabel}&nbsp;&nbsp;&nbsp;&nbsp;
                                <Form.Input
                                onBlur={this.handleOnBlur}
                                onChange={this.handleChange(formCtx.updateModel)}
                                onFocus={this.handleOnFocus}
                                value={v}
                                error
                                {...i}
                                {...ip}
                                {...l}
                                {...ml}
                                {...t}
                                {...ph}
                                {...ro}
                                {... (!parseBool(inline, false) && formCtx != null && formGrpCtx.fluid) ? { fluid: true } : { width: width }}
                            />
                        </div>
                        :
                        <Form.Field inline={parseBool(inline, formCtx.inline)} required={getRequired(validation)} {...e} {...w} >
                            {fieldLabel}
                            {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                            <Input
                                onBlur={this.handleOnBlur}
                                onChange={this.handleChange(formCtx.updateModel)}
                                onFocus={this.handleOnFocus}
                                value={v}
                                {...i}
                                {...ip}
                                {...l}
                                {...ml}
                                {...t}
                                {...ph}
                                {...ro}
                                {... (!parseBool(inline, false) && formCtx != null && (width == null || formGrpCtx.fluid)) ? { fluid: true } : {}}
                            />
                        </Form.Field>
                }
            </FormGroupContext.Consumer>
        )
    }

    handleIconMouseOver = (event: SyntheticMouseEvent<>) => {
        this.setState({ mouseOverIcon: true })
    }

    handleIconMouseOut = (event: SyntheticMouseEvent<>) => {
        this.setState({ mouseOverIcon: false })
    }

    handleOnBlur = (event: SyntheticFocusEvent<>) => {
        this.setState({ inFocus: false }, () => {
            const { onBlur } = this.props
            if (onBlur) {
                onBlur(event)
            }
        })
    }

    handleOnFocus = (event: SyntheticFocusEvent<>) => {
        this.setState({ inFocus: true })
    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.debug(`XcInputText.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`)
        const v = event.target.value
        this.setState({ errorMessage: null, validationStatus: ValidationStatus.NotValidate }, () => {
            updateModel(this.props.name, v)
        })

    }

    /**
     * API called by container form
     */
    validate(model: Object, formName: string) : Promise<ValidationStatus> {
        const { label, name, validation, value } = this.props;
        let errorMessage: ?string = null
        let validationStatus = ValidationStatus.ValidateSuccess

        if (getRequired(validation)) {
            const v = getStringValue(value, model, name)
            if (isNullOrEmpty(v)) {
                validationStatus = ValidationStatus.ValidateFail
                errorMessage =  xlate('error.MISSING_MANDATORY_FIELD', [constructLabel(formName, name, label)])
            }
        }
        this.setState({ errorMessage: errorMessage, validationStatus: validationStatus })
        return Promise.resolve(validationStatus)
    }

}

export const XaInputText = (props: Props) => (
    <FormContext.Consumer>
        {context =>
            <XcInputText context={context} {...props} />
        }
    </FormContext.Consumer>
)