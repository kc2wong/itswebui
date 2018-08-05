// @flow
import _ from 'lodash';
import * as React from 'react';

// import { ButtonGroup, ButtonToolbar } from 'react-bootstrap';
import { Button } from 'semantic-ui-react'
import { XcButton } from './XcButton';
import { parseBool } from 'shared/util/lang';

type ButtonGroupContextType = {
}

const ButtonGroupContext = React.createContext(null);

type Props = {
    alignRight: ?bool,
    toolbar: ?bool,
    children: Array<any>
}

export class XcButtonGroup extends React.Component<Props, {}> {
    render() {
        const toolbar = parseBool(this.props.toolbar, false);
        const className = parseBool(this.props.alignRight, false) ? { className: 'pull-right' } : {}
        const buttonGroupContextType: ButtonGroupContextType = {
        };

        // return (
        //     <ButtonGroupContext.Provider value={buttonGroupContextType}>
        //         {group && (
        //             <ButtonGroup {...className} >
        //                 {this.props.children}
        //             </ButtonGroup>
        //         )}
        //         {!group && (
        //             <ButtonToolbar {...className} >
        //                 {this.props.children}
        //             </ButtonToolbar>
        //         )}
        //     </ButtonGroupContext.Provider>
        // )
        
        return (
            <ButtonGroupContext.Provider value={buttonGroupContextType}>
                {!toolbar && (
                    <React.Fragment>
                        {this.props.children}
                    </React.Fragment>
                )}
                {toolbar && (
                    <Button.Group {...className} >
                        {this.props.children}
                    </Button.Group>
                )}
            </ButtonGroupContext.Provider>
        )
    }

}

export default ButtonGroupContext;