import _ from 'lodash';
import React, { Component } from 'react';
import { Dimmer, Loader } from  'semantic-ui-react';

type Props = {
    message?: string
}

type State = {

}

export class XcLoader extends Component<Props, State> {
    render() {
        const { message } = this.props;
        const t = message != null ? { text: message } : {};
        return (
            // <Loader fullPage loading {...t} />
            <Dimmer active inverted>
                <Loader>{message}</Loader>
            </Dimmer>
        )
    }
}
