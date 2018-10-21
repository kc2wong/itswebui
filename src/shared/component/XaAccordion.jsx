// @flow
import _ from 'lodash'
import * as React from 'react';
import { Accordion, Icon, Label } from 'semantic-ui-react';
import { parseBool } from 'shared/util/lang';
import { ThemeContext } from './XaTheme'

type XaAccordionPaneProps = {
    title: string,
    children: any
}

type XaAccordionPaneState = {

}

class XaAccordionPane extends React.Component<XaAccordionPaneProps, XaAccordionPaneState> {
    render() {
        const { title, ...props } = this.props
        const active = this.getActive(props)

        return (
            <ThemeContext.Consumer>
                {theme => (
                    <React.Fragment>
                        <Accordion.Title {...props} >
                            <Icon style={active ? { color: theme.secondaryVariant } : {}} name='dropdown' />
                            <font color={active ? theme.secondaryVariant : ""}>{title}</font>
                        </Accordion.Title>
                        <Accordion.Content active={active}>
                            {this.props.children}
                        </Accordion.Content>
                    </React.Fragment>
                )}
            </ThemeContext.Consumer>
        )
    }

    getActive(props: Object): boolean {
        return parseBool(props.active, false)
    }
}    


type XaAccordionProps = {
    children: React.ChildrenArray<React.Element<any>>
}

type XaAccordionState = {
    index: number
}

export class XaAccordion extends React.Component<XaAccordionProps, XaAccordionState> {
    static Pane = XaAccordionPane;

    constructor(props: XaAccordionProps) {
        super(props)

        this.state = {
            index: 0
        }
    }

    render() {
        const { ...props } = this.props
        const { index } = this.state
        return (
            <Accordion styled {...props}>
                {React.Children.map(this.props.children, (child, idx) => child != null ? React.cloneElement(child, {active: index == idx,  index: idx, onClick: this.handleClick(idx) }) : child)}
            </Accordion>
        )
    }

    handleClick = (row: number) => (event: SyntheticMouseEvent<>) => {
        this.setState({ index: row })    
    }
    
}