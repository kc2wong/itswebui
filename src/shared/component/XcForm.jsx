// @flow
import _ from 'lodash'
import * as React from 'react'
import { Form } from 'semantic-ui-react'
import update from 'immutability-helper'
import { Decimal } from 'decimal.js'

import { BaseModel } from 'shared/model'
import { addFloat, parseBool } from 'shared/util/lang'

import { ValidationStatus } from './validation/XaValidationStatus'
import './XcForm.css'

export type FormContextType = {
    attach: (component: any) => void,
    inline: boolean,
    name: string,
    model?: Object,
    onSubmit?: () => void,
    subLabelColor?: string,
    updateModel: (name: string, value:any) => void,
    patchModel: (name: string, delta:number) => void,
    reset:() => void,
    validate: () => Promise<ValidationStatus>
}

export const defaultFormContext: FormContextType = {
    attach: (component: any) => {},
    inline: false,
    name: "", 
    model: {},
    updateModel: (name: string, value:any) => {},
    patchModel: (name: string, delta:number) => {},
    reset: () => {},
    validate: () => { return new Promise((resolve, reject) => resolve(ValidationStatus.NotValidate)) }
}; 

const FormContext = React.createContext(defaultFormContext);

type Props = {
    inline: ?boolean,
    name: string,
    model: Object,
    onModelUpdate?: (model: Object) => void,
    onSubmit?: () => void,
    subLabelColor?: string,
    children: ?React.Node
}

type State = {
    componentMap: Map<String, any>,
    validationStatus: ValidationStatus
}

export class XcForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super();
        this.props = props;
        this.state = { componentMap: new Map(), validationStatus: ValidationStatus.NotValidate }
    }

    render() {
        const { inline, model, name, onModelUpdate, onSubmit, subLabelColor, ...props } = this.props
        const formContextType: FormContextType = {
            attach: (component: any) => {
                const { componentMap } = this.state
                componentMap.set(component.props.name, component)
            },
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
                // const newValue = parseFloat(model[name]) + delta
                const newValue = addFloat(model[name], delta)
                if (!_.isNaN(newValue)) {
                    const newModel = update(model, {[name]: {$set: newValue}});                
                    onModelUpdate && onModelUpdate(newModel);                    
                }
            },
            reset: () => {
                const { componentMap } = this.state
                _.forEach([ ...componentMap.values() ], c => c.reset())
            },
            validate: (): Promise<ValidationStatus> => {
                const { componentMap } = this.state
                console.debug("Validate components" + componentMap.toString())
                return Promise.all(_.map([ ...componentMap.values() ], c => c.validate(model, name))).then(values => {
                    // check if any of field does not return success
                    const validationStatus = _.findIndex(values, v => v != ValidationStatus.ValidateSuccess) == -1 ? ValidationStatus.ValidateSuccess : ValidationStatus.ValidateFail
                    this.setState({ validationStatus: validationStatus })
                    return Promise.resolve(validationStatus)
                })
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