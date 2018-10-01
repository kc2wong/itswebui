// @flow
import _ from 'lodash'
import * as React from 'react';
import { Form } from 'semantic-ui-react';
import update from 'immutability-helper';

import { BaseModel } from 'shared/model';
import { parseBool } from 'shared/util/lang';

import './XcForm.css';

export type FormContextType = {
    inline: boolean,
    name: string,
    model?: Object,
    onSubmit?: () => void,
    subLabelColor?: string,
    updateModel: (name: string, value:any) => void,
    patchModel: (name: string, delta:number) => void,
}

const defaultFormContextType: FormContextType = {
    inline: false,
    name: "", 
    model: {},
    updateModel: (name: string, value:any) => {},
    patchModel: (name: string, delta:number) => {}
}; 

const FormContext = React.createContext(defaultFormContextType);

type Props = {
    inline: ?boolean,
    name: string,
    model: BaseModel,
    onModelUpdate?: (model: BaseModel) => void,
    onSubmit?: () => void,
    subLabelColor?: string,
    children: ?React.Node
}

type State = {
}

export class XcForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super();
        this.props = props;
        this.state = {}
    }

    render() {
        const { inline, model, name, onModelUpdate, onSubmit, subLabelColor, ...props } = this.props
        const formContextType: FormContextType = {
            inline: parseBool(inline, false),
            name: name, 
            model: model,
            onSubmit: onSubmit,
            subLabelColor: subLabelColor,
            updateModel: (name: string, value: any) => { 
                if (onModelUpdate != null) {
                    const newModel = update(model, {[name]: {$set: value}});
                    onModelUpdate(newModel);
                }
                else {
                    model[name] = value
                }
            },    
            patchModel: (name: string, delta: number) => { 
                const newValue = parseFloat(model[name]) + delta
                if (!_.isNaN(newValue)) {
                    const newModel = update(model, {[name]: {$set: newValue}});                
                    onModelUpdate && onModelUpdate(newModel);                    
                }
            }    
        }; 
        return (
            <FormContext.Provider value={formContextType}>
                <Form className="xcForm" {...props} >{this.props.children}</Form>
            </FormContext.Provider>
        );
        
    }

}

export default FormContext;