// @flow
import _ from 'lodash';
import * as React from 'react';
import { Sidebar, Segment, Button, Menu, Image, Icon, Header, List } from 'semantic-ui-react';
import { MenuHierarchy } from 'app/model/security/menuHierarchy'
import { xlate } from 'shared/util/lang'

type ListMenuProps = {
    menuHierarchy: MenuHierarchy,
    onClickMenuItem: (menuItem: MenuHierarchy) => void
}

type ListMenuState = {
    expand: boolean
}

class ListMenu extends React.Component<ListMenuProps, ListMenuState> {

    constructor(props: ListMenuProps) {
        super(props);
        this.state = { expand: false }
    }
    
    render() {
        const { menuHierarchy, onClickMenuItem } = this.props
        const { expand } = this.state
        const leaf = menuHierarchy.subMenu == null
        return (
            menuHierarchy ? (
                <List.Item>
                    <List.Icon name={leaf ? 'file alternate' : expand ? 'folder open outline' : 'folder outline'} onClick={this.handleClickMenuItem} />
                    <List.Content>
                        <List.Description onClick={this.handleClickMenuItem}>{xlate(`menu.${menuHierarchy.name}`)}</List.Description>
                        {expand && !leaf && (_.map(menuHierarchy.subMenu, mi => (
                            <List.List key={mi.name} >
                                <ListMenu menuHierarchy={mi} onClickMenuItem={onClickMenuItem} />
                            </List.List>
                        )))}
                    </List.Content>
                </List.Item >
            ) : null
        )
    }

    handleClickMenuItem = () => {
        const { menuHierarchy, onClickMenuItem } = this.props
        const leaf = (menuHierarchy.subMenu == null)

        if (!leaf) {
            this.setState({ expand: !this.state.expand })
        }
        else {
            onClickMenuItem(menuHierarchy)
        }
    }
}


type Props = {
    menuHierarchy: MenuHierarchy,
    onClose: () => void,
    onClickMenuItem: (menuItem: MenuHierarchy) => void,
    open: bool,
    children: React.Node
}

type State = {
    visible: bool,
}

export class SidebarMenu extends React.Component<Props, State> {

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        return {
            visible: nextProps.open
        }
    }

    constructor(props: Props) {
        super(props);
        this.state = SidebarMenu.getDerivedStateFromProps(props, { visible: false })
    }

    render() {
        const { menuHierarchy, onClickMenuItem } = this.props;
        const { visible } = this.state;
        return (
            <Sidebar.Pushable style={{ marginTop: 0, flexGrow: 1, display: "flex", flexDirection: "column" }} as={Segment}>
                <Sidebar
                    as={Segment}
                    animation='overlay'
                    vertical
                    visible={visible}
                    icon='labeled'
                    width="very wide"
                    inverted
                >
                    <div style={{ marginLeft: 20, marginTop: 10 }}><h4>{xlate(`menu.${menuHierarchy.name}`)}</h4></div>
                    <List inverted style={{ marginLeft: 20, marginTop: 10 }}>
                        {_.map(menuHierarchy.subMenu, mi => (
                            <ListMenu key={mi.name} menuHierarchy={mi} onClickMenuItem={onClickMenuItem} />
                        ))}
                    </List>
                </Sidebar>
                <Sidebar.Pusher dimmed={visible} onClick={this.handlePusherClick} style={{ display: "flex", flexDirection: "column" }} >
                    {this.props.children}
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        )
    }

    defaultState() {
        const { open } = this.props;
        return {
            visible: open
        }
    }

    handlePusherClick = () => {
        const { onClose } = this.props;
        const { visible } = this.state;
        if (visible) {
            this.setState({ visible: false }, () => {
                onClose()
            })
        }

    }

    handleExpandCollapse = () => {
        console.log('hihi')
    }
}
