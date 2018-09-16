// @flow
import _ from 'lodash';
import * as React from 'react';
import { Form } from 'semantic-ui-react';
import { parseBool } from 'shared/util/lang';

type FormGroupContextType = {
    fluid: bool
}

const defaultFormGroupContextType: FormGroupContextType = {
    fluid: true
}; 

const FormGroupContext = React.createContext(defaultFormGroupContextType);

type Props = {
    equalsWidth: ?boolean,
    children: Array<any>
}

type State = {
}

export class XcFormGroup extends React.Component<Props, State> {

    render() {   
        const widths = parseBool(this.props.equalsWidth, true) == true ? {widths: "equal"} : {}

        // Form elements under form group, the width is determined by the width attribute of the child
        const formGroupContextType: FormGroupContextType = {
            fluid: false
        }

        return (
            <FormGroupContext.Provider value={formGroupContextType}>
                <Form.Group {...widths}>{this.props.children}</Form.Group>
            </FormGroupContext.Provider>
        )
    }    
}

export default FormGroupContext;