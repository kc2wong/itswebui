import _ from 'lodash';
import React, { Component } from 'react';
import { Form, Select } from 'semantic-ui-react';
import FormContext from './XcForm';
import { constructLabel, createColumnClass, getRequired, getStringValue } from './XcFormUtil';
import type { XcSelectConstraint } from './validation/XcFieldConstraint';
import { parseBool, xlate } from 'shared/util/lang';

import './XcSelect.css';

type Props = {
    disabled: ?bool,
    inline: ?bool,
    label: ?string,    
    name: string,
    numeric: ?bool,
    options: [XcOption],
    onChange: ?(SyntheticInputEvent<>, any) => void,
    placeholder: ?string,
    readonly: ?bool,
    subLabel?: string,
    validation: ?XcSelectConstraint,
    value: ?string,
    width?: number
}

type State = {

}

export class XcSelect extends Component<Props, State> {

    static defaultProps = {
        width: 12
    };

    render() {
        const { disabled, inline, label, name, options, numeric, onChange, placeholder, readonly, subLabel, validation, value, width, ...props } = this.props
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const className = parseBool(readonly, false) ? { className: "xc-select-readonly" } : {}
        return (
            <FormContext.Consumer>
                {context =>
                    context.name == "" ?
                    <span>{constructLabel(context.name, name, label)}&nbsp;&nbsp;&nbsp;&nbsp;
                        <Select
                            disabled={parseBool(disabled, false)}
                            onChange={this.handleChange(context.updateModel)}
                            options={this.createOptions(options, readonly, getStringValue(value, context.model, name))}
                            required={getRequired(validation)}
                            value={getStringValue(value, context.model, name)}
                            {...className}
                            {...ph}
                            />
                    </span>
                    :
                    <Form.Select
                        inline={parseBool(inline, false)}
                        label={constructLabel(context.name, name, label)}
                        onChange={this.handleChange(context.updateModel)}
                        options={this.createOptions(options, readonly, getStringValue(value, context.model, name))}
                        required={getRequired(validation)}
                        value={getStringValue(value, context.model, name)}
                        {...className}
                        {...ph}
                    >
                    </Form.Select>
                }
            </FormContext.Consumer>
        )
    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>, target: any) => {
        const { onChange, options, readonly } = this.props;
        if (!parseBool(readonly, false)) {
            const value = target.value;
            console.debug(`XcSelect.handleChanged(), name=${this.props.name}, value=${value}`);
            const numeric = parseBool(this.props.numeric, false);

            if (onChange) {
                onChange(event, target)
            }
            if (parseBool(event.defaultPrevented, false) != true) {
                if (value != null) {
                    updateModel(this.props.name, numeric ? Number(value) : value);
                }
                else {
                    updateModel(this.props.name, null);
                }    
            }
        }
        event && event.preventDefault()        
    }

    createOptions = (options: [XcOption], readonly: bool, value: string): [Object] => {
        return _.map(options, (o) => (
            Object.assign(parseBool(readonly, false) ? { disabled: value != o.key } : {}, { key: `${o.key}`, text: `${o.text}`, value: `${o.key}` })
        ))
    }
}

export class XcOption {
    key: string;
    text: string;
    constructor(key: string, text: string) { this.key = key; this.text = text }
}
