import _ from 'lodash';
import React, { Component } from 'react';
// import { Checkbox, FormGroup } from 'react-bootstrap';
import { Checkbox } from 'semantic-ui-react';
import FormContext from './XcForm';
import { parseBool, xlate } from 'shared/util/lang';
import { constructLabel, createColumnClass, getRequired } from './XcFormUtil';

import './XcInputText.css';

type Props = {
    label: string,
    name: string,
    value: bool, 
}

type State = {

}

export class XcCheckbox extends Component<Props, State> {
    render() {
        const { label, name, value, ...props } = this.props

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
                    <Checkbox checked={value} label={constructLabel(context.name, name, label)} onChange={this.handleChanged(context.updateModel)} />
                }
            </FormContext.Consumer>
        )

    }

    handleChanged = (updateModel: any) => (event: SyntheticInputEvent<>) => {
        console.debug(`XcCheckbox.handleChanged(), name=${this.props.name}, newValue=${event.target.checked}`);
        updateModel(this.props.name, event.target.checked);
    }    
    
}
