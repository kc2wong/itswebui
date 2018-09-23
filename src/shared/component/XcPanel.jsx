// @flow
import * as React from 'react';
import { Dimmer, Header, Loader, Segment } from 'semantic-ui-react';
import { parseBool } from 'shared/util/lang';

class Header2 extends React.Component<{ children: React.Node }, {}> {
    render() {
        return (
            <Header as="h5" attached="top">{this.props.children}</Header>
        )
    }
}

class Body extends React.Component<{ children: React.Node }, {}> {
    render() {
        return (
            <Segment attached>{this.props.children}</Segment>
        )
    }
}

class Footer extends React.Component<{ children: React.Node }, {}> {
    render() {
        return (
            <Segment attached="bottom">{this.props.children}</Segment>
        )
    }
}

type Props = {
    loading: ?boolean,
    children: React.ChildrenArray<
    | React.Element<Header2>
    | React.Element<Body>
    | React.Element<Footer>
    >;
}

type State = {

}

export class XcPanel extends React.Component<Props, State> {
    static Header = Header2
    static Body = Body
    static Footer = Footer

    render() {
        const { loading } = this.props
        return (
            parseBool(loading, false) ? (<Dimmer.Dimmable dimmed><Dimmer active inverted><Loader /></Dimmer>{this.props.children}</Dimmer.Dimmable>) : this.props.children
        )
    }
}    
