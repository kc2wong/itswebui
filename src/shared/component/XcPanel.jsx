// @flow
import * as React from 'react';
// import { Panel } from 'react-bootstrap';
import { Header, Segment } from 'semantic-ui-react';
import { xlate } from 'shared/util/lang';

class Header2 extends React.Component<{ children: React.Node }, {}> {
    render() {
        // return (
        //     <Panel.Heading>{this.props.children}</Panel.Heading>
        // )
        return (            
            <Header as="h5" attached="top">{this.props.children}</Header>
        )
    }
}

class Body extends React.Component<{ children: React.Node }, {}> {
    render() {
        // return (
        //     <Panel.Body>{this.props.children}</Panel.Body>
        // )
        return (
            <Segment attached>{this.props.children}</Segment>
        )
    }
}

class Footer extends React.Component<{ children: React.Node }, {}> {
    render() {
        // return (
        //     <Panel.Footer>{this.props.children}</Panel.Footer>
        // )
        return (
            <Segment attached="bottom">{this.props.children}</Segment>
        )
    }
}    

type Props = {
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
        // return (
        //     <Panel>
        //         {this.props.children}
        //     </Panel>
        // )
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }
}    
