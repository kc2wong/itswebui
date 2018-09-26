// @flow
import React, { Component } from 'react';
import { Enum } from 'enumify';
import { Form, Icon, Input } from 'semantic-ui-react';
import DayPicker from 'react-day-picker'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import FormContext from './XcForm';
import FormGroupContext from './XcFormGroup';
import { constructLabel, createColumnClass, getRequired, getStringValue } from './XcFormUtil';
import { IFieldConstraint, XcInputTextConstraint } from './validation/XcFieldConstraint';
import type { XcIconProps } from './XcIconProps';
import { parseBool, xlate } from 'shared/util/lang';

import 'react-day-picker/lib/style.css';
import './XcInputText.css';

class IconPosition extends Enum { }
IconPosition.initEnum({ Left: { value: 'left' }, Right: { value: 'right' } });

type Props = {
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
    showCalendar: boolean
}

export class XaInputDate extends Component<Props, State> {

    static IconPosition = IconPosition

    static defaultProps = {
        width: 12
    };

    constructor(props: Props) {
        super();
        this.props = props;
        this.state = { showCalendar: false }
    }

    render() {
        const { inline, label, loading, name, password, placeholder, readonly, subLabel, validation, value, width, ...props } = this.props;
        const { showCalendar } = this.state
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = { icon: <Icon link name="calendar" onClick={this.handleClick} /> }
        const l = parseBool(loading, false) ? { loading: true } : {}
        const r = parseBool(readonly, false) ? { readOnly: true } : {}
        const float = subLabel ? { style: { float: "left" } } : {}
        const w = width != null ? { width: width } : {}

        const datePicker = (
            <div className='DayPickerInput-OverlayWrapper' style={{ marginLeft: 0 }}>
                <div className='DayPickerInput-Overlay'>
                    <DayPicker />
                </div>
            </div>
        )

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
                                        {...l}
                                        {...ph}
                                        {...r}
                                        {... (!parseBool(inline, false) && formCtx != null && formGrpCtx.fluid) ? { fluid: true } : { width: width }}
                                    />
                                    {showCalendar && (
                                        datePicker
                                    )}
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
                                        {...l}
                                        {...ph}
                                        {...r}
                                        {... (!parseBool(inline, false) && formCtx != null && formGrpCtx.fluid) ? { fluid: true } : {}}
                                    />
                                    {showCalendar && (
                                        datePicker
                                    )}
                                </Form.Field>
                        }
                    </FormGroupContext.Consumer>
                }
            </FormContext.Consumer>
        )
    }

    handleClick = (event: SyntheticMouseEvent<>) => {
        const { showCalendar } = this.state;
        this.setState({ showCalendar: !showCalendar })
    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.debug(`XcInputText.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`);
        updateModel(this.props.name, event.target.value);
    }

}
