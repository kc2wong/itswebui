// @flow
import * as React from 'react';
import { Segment } from 'semantic-ui-react'

type Props = {
    children: React.ChildrenArray<any>,
}

type State = {

}

export class XcCard extends React.Component<Props, State> {
    render() {
        const { ...props } = this.props
        return (
            <Segment raised {...props} >
                {this.props.children}
            </Segment>
        )
    }
}
