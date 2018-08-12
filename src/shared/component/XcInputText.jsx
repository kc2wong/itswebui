// @flow
import React, { Component } from 'react';
import { Form, Input } from 'semantic-ui-react';
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
    password: ?bool,
    placeholder: ?string,
    readonly: ?bool,
    subLabel? :string,
    value: ?string,
    validation: ?XcInputTextConstraint,
    width: ?number
}

type State = {
}

export class XcInputText extends Component<Props, State> {

    static defaultProps = {
        width: 12
    };

    render() {
        const { icon, label, name, password, placeholder, readonly, subLabel, validation, value, width, ...props } = this.props;
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = icon != null ? { icon: icon.name, iconPosition: "left" } : {};
        const p = Object.assign({}, parseBool(password, false) ? { type: 'password' } : {}, props)
        const r = parseBool(readonly, false) ? { readOnly: true } : {}
        const float = subLabel ? { style: { float: "left" } } : {}
        return (
            <FormContext.Consumer>
                {formCtx =>
                    <FormGroupContext.Consumer>
                        {formGrpCtx =>
                            <Form.Field required={getRequired(validation)}>
                                <label {...float}>{constructLabel(formCtx.name, name, label)}</label>
                                {subLabel ? <small {...float} {... formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                                <Input
                                    onChange={this.handleChange(formCtx.updateModel)}                                    
                                    type="text"
                                    value={getStringValue(value, formCtx.model, name)}
                                    {...i}
                                    {...p}
                                    {...ph}
                                    {...r}
                                    {... (formCtx != null && formGrpCtx.fluid) ? { fluid: true } : { width: width }}
                                />
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

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.debug(`XcInputText.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`);
        updateModel(this.props.name, event.target.value);
    }       
     
}
