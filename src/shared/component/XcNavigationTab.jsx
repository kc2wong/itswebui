// @flow
import _ from 'lodash';
import * as React from 'react';
import { Component } from 'react';
import { Menu, Tab } from 'semantic-ui-react';

import './XcNavigationTab.css';

type TabPaneProps = {
    active?: bool,
    component: Component<>,
    id: string,    
    label: string
}

class XcTabPane extends React.Component<TabPaneProps, {}> {
    render() {        
        const { active, component, id, label } = this.props
        const style = active ? { style: { marginBottom: 0, paddingTop: 0, paddingBottom: 0, flexGrow: 1, display: "flex", flexDirection: "column" } } : {}
        const className = active ? { className: "xcActiveTabPane" } : {}
        return (
            <Tab.Pane active={active} key={id} {...className} {...style} >{component}</Tab.Pane>
        )
    }
}

type Props = {    
    onTabChange: ?(tabIdx: number) => void,
    tabIndex: ?number,
    children: Array<XcTabPane>
}

type State = {
    tabIdx: number
}

export class XcNavigationTab extends React.Component<Props, State> {
    static Pane = XcTabPane;

    constructor(props: Props) {
        super(props);
        this.state = {
            tabIdx: props.tabIndex ? props.tabIndex : 0
        }
    }

    render() {
        const { onTabChange, tabIndex, ...props } = this.props
        const tabIdx = tabIndex != null ? tabIndex : this.state.tabIdx
        console.log(`tabIndex = ${tabIndex != null ? tabIndex : 'null'}, tabIdx = ${tabIdx}`)
        console.log(_.size(this.props.children))
        const tabPanes = _.map(this.props.children, (p, idx) => {
            const { component, id, label } = p.props
            const className = tabIdx == idx ? { className: "xcActiveTabMenu" } : {}
            return { menuItem: <Menu.Item key={id} {...className} >{label}</Menu.Item>, pane: React.cloneElement(p, {active: tabIdx == idx} ) }
        })
        
        return (
            <Tab activeIndex={tabIdx} 
                className="xcTab" 
                onTabChange={this.handleTabChange} 
                menu={{ attached: true, tabular: true, style: { flexShrink: 0 } }} 
                panes={tabPanes} 
                renderActiveOnly={false} 
                {...props} />
        )
    }

    handleTabChange = (event: SyntheticEvent<>, data: Object) => {
        const { onTabChange } = this.props
        const { activeIndex } = data
        this.setState({tabIdx: activeIndex}, () => {
            if (onTabChange) {
                onTabChange(activeIndex)
            }
        })
    }
}

