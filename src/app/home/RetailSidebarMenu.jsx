// @flow
import _ from 'lodash';
import * as React from 'react';
import { Divider, Sidebar, Segment, Button, Menu, Image, Icon, Header, List } from 'semantic-ui-react';
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'
import { AccountSelectorContext, type AccountSelectorContextType } from './RetailHome';
import { xlate } from 'shared/util/lang'

type Props = {
    tradingAccounts: Array<SimpleTradingAccount>,
    onClose: () => void,
    onSelectAccount: (simpleTradingAccount: SimpleTradingAccount) => void,
    open: bool,
    children: React.Node
}

type State = {
    visible: bool,
}

export class RetailSidebarMenu extends React.Component<Props, State> {

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        return {
            visible: nextProps.open
        }
    }

    constructor(props: Props) {
        super(props);
        this.state = RetailSidebarMenu.getDerivedStateFromProps(props, { visible: false })
    }

    render() {
        const { onSelectAccount, tradingAccounts} = this.props
        const { visible } = this.state

        return (
            <AccountSelectorContext.Consumer>
                {context =>
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
                            <div style={{ marginLeft: 20, marginTop: 10 }}><Header inverted as="h5"><Icon name="user"/><Header.Content>{xlate(`menu.selectAccount`)}</Header.Content></Header></div>
                            <List inverted style={{ marginLeft: 20, marginTop: 10 }}>
                                {(_.map(tradingAccounts, ta =>
                                    <List.Item key={ta.tradingAccountCode} onClick={this.handleSelectTradingAccount(context, ta)}>
                                        <List.Icon name={context.gelectTradingAccount() && this.saveGetTradingAccountNo(context.gelectTradingAccount()) == ta.tradingAccountCode ? 'check square outline' : 'square outline'} />
                                        <List.Content>
                                            <List.Header>{ta.tradingAccountCode}</List.Header>
                                            <List.Description>{ta.nameOneDefLang}</List.Description>
                                        </List.Content>
                                    </List.Item>
                                ))}                                
                            </List>
                            <Divider />
                            <div style={{ marginLeft: 20, marginTop: 10 }}><Header inverted as="h5"><Icon name="setting"/><Header.Content>{xlate(`home.preference`)}</Header.Content></Header></div>
                            <Divider />
                            <div style={{ marginLeft: 20, marginTop: 10 }}><Header inverted as="h5"><Icon name="address card"/><Header.Content>{xlate(`home.changePassword`)}</Header.Content></Header></div>
                        </Sidebar>
                        <Sidebar.Pusher dimmed={visible} onClick={this.handlePusherClick} style={{ display: "flex", flexDirection: "column" }} >
                            {this.props.children}
                        </Sidebar.Pusher>
                    </Sidebar.Pushable>
                }
            </AccountSelectorContext.Consumer>
        )
    }

    defaultState() {
        const { open } = this.props;
        return {
            visible: open
        }
    }

    saveGetTradingAccountNo(simpleTradingAccount: ?SimpleTradingAccount): string {
        return simpleTradingAccount != null ? simpleTradingAccount.tradingAccountCode : ""
    }

    handleSelectTradingAccount = (context: AccountSelectorContextType, simpleTradingAccount: SimpleTradingAccount) => (event: SyntheticMouseEvent<>) => {
        context.selectTradingAccount(simpleTradingAccount)
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
