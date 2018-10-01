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
import type { XcIconProps } from './XcIconProps'
import type { FormContextType } from './XcForm'
import type { FormGroupContextType } from './XcFormGroup'
import { parseBool, xlate } from 'shared/util/lang';
import { currentDate, formatDate, parseDate } from 'shared/util/dateUtil';

import 'react-day-picker/lib/style.css';
import './XcInputText.css';

type Props = {
    dateFormat: ?string,
    inline: ?bool,
    label?: string,
    name: string,
    placeholder: ?string,
    readonly: ?bool,
    subLabel?: string,
    value: ?Date,
    validation: ?XcInputTextConstraint,
    width: ?number
}

type State = {
    inFocus: boolean,
    intermediate: string,
    requiredLength: number,
    showCalendar: boolean
}

export class XaInputDate extends Component<Props, State> {

    static defaultProps = {
        width: 12
    };

    constructor(props: Props) {
        super();
        this.props = props;
        this.state = { 
            inFocus: false, intermediate: formatDate(this.props.value, this.props.dateFormat), 
            requiredLength: formatDate(currentDate(), props.dateFormat).replace(/\D/g, '').length, 
            showCalendar: false 
        }
    }

    render() {
        return (
            <FormContext.Consumer>
                {formCtx =>
                    <FormGroupContext.Consumer>
                        {formGrpCtx => this.constructInputField(formCtx, formGrpCtx)}
                    </FormGroupContext.Consumer>
                }
            </FormContext.Consumer>
        )
    }

    handleChange = (event: SyntheticInputEvent<>) => {
        console.debug(`XaInputDate.handleChanged(), name=${this.props.name}, newValue=${event.target.value}`);
        const { dateFormat } = this.props
        const { requiredLength } = this.state
        const v = event.target.value
        const length = v.length

        let validateOk = true

        if (length > 0) {
            if (!/^\d+$/.test(v)) {
                // input must be number
                validateOk = false
            }
            else if (length > requiredLength) {
                validateOk = false
            }
        }

        if (validateOk) {
            this.setState({ intermediate: v })
        }
        else {
            event.preventDefault()
        }
    }

    handleClick = (event: SyntheticMouseEvent<>) => {
        const { showCalendar } = this.state;
        this.setState({ showCalendar: !showCalendar })
    }
    
    handleDayClick = (updateModel: any) => (date: Date, modifiers: Object, event: SyntheticMouseEvent<>) => {
        const { name } = this.props
        this.setState({showCalendar: false}, () => {
            updateModel(name, date);
            this.forceUpdate()
        })
    }

    handleOnBlur = (updateModel: any) => (event: SyntheticFocusEvent<>) => {
        console.debug(`XaInputDate.handleOnBlur(), name=${this.props.name}`);
        const { dateFormat, name } = this.props
        const { intermediate, requiredLength } = this.state

        this.setState({ inFocus: false }, () => {
            if (intermediate.length == 0) {
                updateModel(name, null)
            }
            if (intermediate.length == requiredLength) {
                const date = parseDate(intermediate)
                // check if input date is valid
                if (intermediate == formatDate(date).replace(/\D/g, '')) {
                    updateModel(name, date)
                }
            }
            this.forceUpdate()
        })
    }

    handleOnFocus = (date: ?Date, dateFormat: ?string) => (event: SyntheticFocusEvent<>) => {
        console.debug(`XaInputDate.handleOnFocus(), name=${this.props.name}`);
        // remove non numeric character
        this.setState({ inFocus: true, intermediate: formatDate(date, dateFormat).replace(/\D/g, ''), showCalendar: false })
    }


    getInputDate(value: ?Date, model: ?Object, name: string, dateFormat: ?string): ?Date {
        let rtn = null
        if (value != null) {
            rtn = value
        }
        else if (model != null) {
            rtn = (model[name]: Date)
        }
        else {
            rtn = null
        }
        return rtn
    }


    constructInputField(formCtx: FormContextType, formGrpCtx: FormGroupContextType) {
        const { dateFormat, inline, label, name, placeholder, readonly, subLabel, validation, value, width, ...props } = this.props;
        const { inFocus, intermediate, showCalendar } = this.state
        const ph = placeholder != null ? { placeholder: placeholder.startsWith('#') ? xlate(placeholder.substr(1)) : placeholder } : {};
        const i = { icon: <Icon link name="calendar" onClick={this.handleClick} /> }
        const r = parseBool(readonly, false) ? { readOnly: true } : {}
        const float = subLabel ? { style: { float: "left" } } : {}
        const w = width != null ? { width: width } : {}

        const inputDate = this.getInputDate(value, formCtx.model, name)
        const v = inFocus ? intermediate : formatDate(inputDate, dateFormat)

        const dayPicker = (
            <div className='DayPickerInput-OverlayWrapper' style={{ marginLeft: 0 }}>
                <div className='DayPickerInput-Overlay'>
                    <DayPicker onDayClick={this.handleDayClick(formCtx.updateModel)} month={inputDate} selectedDays={inputDate} />
                </div>
            </div>
        )

        return (
            formCtx.name == "" ?
                <div className="xa-inline-input">{constructLabel(formCtx.name, name, label)}&nbsp;&nbsp;&nbsp;&nbsp;
                    <Form.Input
                        onBlur={this.handleOnBlur(formCtx.updateModel)}
                        onChange={this.handleChange}
                        onFocus={this.handleOnFocus(inputDate, dateFormat)}
                        type="text"
                        value={v}
                        {...i}
                        {...ph}
                        {...r}
                        {... (!parseBool(inline, false) && formCtx != null && formGrpCtx.fluid) ? { fluid: true } : { width: width }}
                    />
                    {showCalendar && (dayPicker)}
                </div>
                :
                <Form.Field inline={parseBool(inline, formCtx.inline)} required={getRequired(validation)} {...w} >
                    <label {...float}>{constructLabel(formCtx.name, name, label)}</label>
                    {subLabel ? <small {...float} {...formCtx.subLabelColor ? { style: { color: formCtx.subLabelColor } } : {}} >&nbsp;&nbsp;{subLabel}</small> : null}
                    <Input
                        onBlur={this.handleOnBlur(formCtx.updateModel)}
                        onChange={this.handleChange}
                        onFocus={this.handleOnFocus(inputDate, dateFormat)}
                        type="text"
                        value={v}
                        {...i}
                        {...ph}
                        {...r}
                        {... (!parseBool(inline, false) && formCtx != null && formGrpCtx.fluid) ? { fluid: true } : {}}
                    />
                    {showCalendar && (dayPicker)}
                </Form.Field>
        )
    }


}
