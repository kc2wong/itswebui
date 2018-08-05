import _ from 'lodash';
import React, { Component } from 'react';
import { Form } from 'semantic-ui-react';
import FormContext from './XcForm';
import { XcOption } from './XcSelect';
import { constructLabel, createColumnClass, getRequired, getStringValue } from './XcFormUtil';
import { IFieldConstraint, XcSelectConstraint } from './validation/XcFieldConstraint';
import { parseBool, xlate } from 'shared/util/lang';

import './XcSelect.css';

type Props = {
    label: ?string,
    inline: ?bool,
    name: string,
    numeric: ?bool,
    options: [XcOption],
    readonly: ?bool,
    validation: ?XcSelectConstraint,
    value: ?string,
    width?: number
}

type State = {

}

export class XcRadio extends Component<Props, State> {

    // static defaultProps = {
    //     width: 12
    // };

    render() {
        const { label, inline, name, options, numeric, readonly, validation, value, width, ...props } = this.props
        // const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const className = parseBool(readonly, false) ? { className: "xc-select-readonly" } : {}
        return (
            <FormContext.Consumer>
                {context =>
                    parseBool(inline, false) ?
                        <Form.Group inline>
                            <label>{constructLabel(context.name, name, label)}&emsp;</label>
                            {this.createOptions(options, readonly, context.updateModel, getStringValue(value, context.model, name))}
                        </Form.Group>
                        :
                        <div className="field">
                            <Form.Group inline>
                                {this.createOptions(options, readonly, context.updateModel, getStringValue(value, context.model, name))}
                            </Form.Group>
                        </div>
                }
            </FormContext.Consumer>
        )
    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>, target: any) => {
        event && event.preventDefault()        

        const { options, readonly } = this.props;
        if (!parseBool(readonly, false)) {
            const value = target.value;
            console.debug(`XcRadio.handleChanged(), name=${this.props.name}, value=${value}`);
            const numeric = parseBool(this.props.numeric, false);
        
            if (value != null) {
                updateModel(this.props.name, numeric ? Number(value) : value);
            }
            else {
                updateModel(this.props.name, null);
            }    
        }
    }

    createOptions = (options: [XcOption], readonly: bool, updateModel: any, value: string): [Object] => {
        return _.map(options, (o) => (
            <Form.Radio checked={o.key == value} key={o.key} label={o.text} onChange={this.handleChange(updateModel)} value={o.key} />
        ))
    }
}
