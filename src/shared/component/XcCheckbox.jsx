import _ from 'lodash';
import React, { Component } from 'react';
import { Enum } from 'enumify';
import { Checkbox } from 'semantic-ui-react';
import FormContext from './XcForm';
import { parseBool, xlate } from 'shared/util/lang';
import { constructLabel, createColumnClass, getRequired } from './XcFormUtil';

import './XcInputText.css';

class Style extends Enum { }
Style.initEnum(['Checkbox', 'Toggle']);


type Props = {
    label: string,
    name: string,
    onChange: ?(SyntheticInputEvent<>, any) => void,
    readonly: ?bool,
    style: ?Style,
    value: bool, 
}

type State = {

}

export class XcCheckbox extends Component<Props, State> {
    static Style = Style

    render() {
        const { label, name, style, value, ...props } = this.props
        const toggle = (style != null && style == Style.Toggle) ? { toggle: true } : {}
        // return (
        //     <FormContext.Consumer>
        //         {context =>
        //             <FormGroup className={createColumnClass()} controlId={`${context.name}_${name}`}>
        //                 <Checkbox checked={value} onChange={this.handleChanged(context.updateModel)}>{constructLabel(context.name, name, label)}</Checkbox>
        //             </FormGroup>
        //         }
        //     </FormContext.Consumer>
        // )

        return (
            <FormContext.Consumer>
                {context =>
                    <Checkbox checked={value} label={constructLabel(context.name, name, label)} onChange={this.handleChange(context.updateModel)} {...toggle} />
                }
            </FormContext.Consumer>
        )

    }

    handleChange = (updateModel: any) => (event: SyntheticInputEvent<>, target: any) => {
    // handleChanged = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        const { onChange, readonly } = this.props;

        if (!parseBool(readonly, false)) {
            const value = target.value;
            console.debug(`XcCheckbox.handleChanged(), name=${this.props.name}, value=${value}`);

            if (onChange) {
                onChange(event, target)
            }
            if (parseBool(event.defaultPrevented, false) != true) {
                updateModel(this.props.name, event.target.checked);                 
            }
        }
        event && event.preventDefault()        

        // console.debug(`XcCheckbox.handleChanged(), name=${this.props.name}, newValue=${event.target.checked}`);        
        // updateModel(this.props.name, event.target.checked);        
    }    
    
}
