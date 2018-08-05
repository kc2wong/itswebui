// @flow
import * as React from 'react';
import { Form } from 'semantic-ui-react';
import update from 'immutability-helper';

import { BaseModel } from 'shared/model';

import './XcForm.css';

type FormContextType = {
    name: string,
    model?: Object,
    onSubmit?: () => void,
    updateModel: (name: string, value:any) => void
}

const defaultFormContextType: FormContextType = {
    name: "", 
    model: {},
    updateModel: (name: string, value:any) => {}
}; 

const FormContext = React.createContext(defaultFormContextType);

type Props = {
    name: string,
    model: BaseModel,
    onModelUpdate?: (model: BaseModel) => void,
    onSubmit?: () => void,
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
        const { model, name, onModelUpdate, onSubmit, ...props } = this.props
        const formContextType: FormContextType = {
            name: name, 
            model: model,
            onSubmit: onSubmit,
            updateModel: (name: string, value: any) => { 
                const newModel = update(model, {[name]: {$set: value}});                
                onModelUpdate && onModelUpdate(newModel);                
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