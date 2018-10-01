// @flow
import React, { Component } from 'react';
import { Enum } from 'enumify';
import { Form, Icon, Input } from 'semantic-ui-react';
import FormContext from './XcForm';
import FormGroupContext from './XcFormGroup';
import { constructLabel, createColumnClass, getRequired, getStringValue } from './XcFormUtil';
import type { XcInputTextConstraint } from './validation/XcFieldConstraint';
import type { XcIconProps } from './XcIconProps'
import { IconPosition } from './XcIconProps'
import { parseBool, xlate } from 'shared/util/lang'

import './XcInputText.css';

type Props = {
    icon?: XcIconProps,
    inline: ?bool,
    label?: string,
    loading?: bool,
    name: string,
    password: ?bool,
    placeholder: ?string,
    readonly: ?bool,
    subLabel?: string,
    value: ?string,
    validation: ?XcInputTextConstraint,
    width: ?number
}

type State = {
    mouseOverIcon: boolean
}

export class XcInputText extends Component<Props, State> {

    static defaultProps = {
        width: 16
    };

    constructor(props: Props) {
        super();
        this.props = props;
        this.state = { mouseOverIcon: false }
    }
    
    render() {
        const { icon, inline, label, loading, name, password, placeholder, readonly, subLabel, validation, value, width, ...props } = this.props;
        const isPassword = parseBool(password, false)
        const { mouseOverIcon } = this.state
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = icon != null ? { icon: <Icon name={icon.name} onMouseOut={this.handleIconMouseOut} onMouseEnter={this.handleIconMouseOver}  link={isPassword || icon.onIconClick != null} onClick={icon.onIconClick} /> } : {};
        const ip = (icon != null && (icon.position == null || icon.position == IconPosition.Left)) ? { iconPosition: IconPosition.Left.value } : {}         // no need to specify position when it is right 
        const l = parseBool(loading, false) ? { loading: true } : {}
        const ml = (validation != null && validation.maxLength != null) ? { maxLength: validation.maxLength }: {}
        const p = Object.assign({}, isPassword && !mouseOverIcon ? { type: 'password' } : {}, props)
        const ro = parseBool(readonly, false) ? { readOnly: true } : {}
        const float = subLabel ? { style: { float: "left" } } : {}
        const w = width != null ? { width: width } : {}

        return (
            <FormContext.Consumer>
                {formCtx =>
                    <FormGroupContext.Consumer>
                        {formGrpCtx =>
                            formCtx.name == "" ?
                                <div className="xa-inline-input">{constructLabel(formCtx.name, name, label)}&nbsp;&nbsp;&nbsp;&nbsp;
                                <Form.Input
                                        onChange={this.handleChange(formCtx.updateModel)}
                                        type="text"
                                        value={getStringValue(value, formCtx.model, name)}
                                        {...i}
                                        {...ip}
                                        {...l}
                                        {...ml}
                                        {...p}
                                        {...ph}
                                        {...ro}
                                        {... (!parseBool(inline, false) && formCtx != null && formGrpCtx.fluid) ? { fluid: true } : { width: width }}
                                    />
                                </div>
                                :
                                <Form.Field inline={parseBool(inline, formCtx.inline)} required={getRequired(validation)} {...w} >
                                    <label {...float}>{constructLabel(formCtx.name, name, label)}</label>
                                    {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                                    <Input
                                        onChange={this.handleChange(formCtx.updateModel)}
                                        type="text"
                                        value={getStringValue(value, formCtx.model, name)}
                                        {...i}
                                        {...ip}
                                        {...l}
                                        {...ml}
                                        {...p}
                                        {...ph}
                                        {...ro}
                                        {... (!parseBool(inline, false) && formCtx != null && (width == null || formGrpCtx.fluid)) ? { fluid: true } : {}}
                                    />
                                </Form.Field>
                        }
                    </FormGroupContext.Consumer>
                }
            </FormContext.Consumer>
        )
    }

    handleIconMouseOver = (event: SyntheticMouseEvent<>) => {
        this.setState({ mouseOverIcon: true })
    }

    handleIconMouseOut = (event: SyntheticMouseEvent<>) => {
        this.setState({ mouseOverIcon: false })
    }

    handleClick = (event: SyntheticMouseEvent<>) => {
        console.log("handleClick.....")
    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.debug(`XcInputText.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`);
        updateModel(this.props.name, event.target.value);
    }

}
