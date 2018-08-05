// @flow
import _ from 'lodash';
import * as React from 'react';
import { Form } from 'semantic-ui-react';

type FormGroupContextType = {
    fluid: bool
}

const defaultFormGroupContextType: FormGroupContextType = {
    fluid: true
}; 

const FormGroupContext = React.createContext(defaultFormGroupContextType);

type Props = {
    children: Array<any>
}

type State = {
}

export class XcFormGroup extends React.Component<Props, State> {

    render() {   
        // Form elements under form group, the width is determined by the width attribute of the child
        const formGroupContextType: FormGroupContextType = {
            fluid: false
        }

        return (
            <FormGroupContext.Provider value={formGroupContextType}>
                <Form.Group>{this.props.children}</Form.Group>
            </FormGroupContext.Provider>
        )
    }    
}

export default FormGroupContext;