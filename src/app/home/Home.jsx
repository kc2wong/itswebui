// @flow
import _ from 'lodash';
import * as React from 'react';
import PropTypes from 'prop-types';

import { XcNavigationTab } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { getCurrentUserid } from 'shared/util/sessionUtil';
import { MessageContext, MessageService } from 'shared/service';
import { AppToolbar, navigator, SidebarMenu } from 'app/home';
import { MenuHierarchy } from 'app/model/security/menuHierarchy'
import CurrencyMaintenanceForm from 'app/component/staticdata/currency/CurrencyMaintenanceForm';
import StmActionMaintenanceForm from 'app/component/staticdata/stmaction/StmActionMaintenanceForm';
import { authenticationService, userProfileService } from 'app/service';

type Props = {
    messageService: MessageService,
    language: Language
}

type State = {
    menuHierarchy: ?MenuHierarchy,
    menuOpen: bool,
    panes: XcNavigationTab.Pane[],
    tabIndex: number
}

const pathMapping = new Map()
    .set('currencyMaintenance', <CurrencyMaintenanceForm/>)
    .set('actionCodeMaintenance', <StmActionMaintenanceForm/>)
    ;

class Home extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            menuHierarchy: null,
            menuOpen: false,
            panes: [],
            tabIndex: -1
        }
    }

    componentDidMount() {
        const { messageService } = this.props
        const { menuHierarchy } = this.state
        if (menuHierarchy == null) {
            messageService.showLoading()
            userProfileService.constructMainMenu().then(m => {
                this.setState({ menuHierarchy: m }, () => {
                    messageService.hideLoading()
                })
            })
        }
    }

    render() {
        const { language } = this.props;
        const { menuHierarchy, menuOpen, panes, tabIndex } = this.state;

        const applicationDate = new Date()

        let userid = getCurrentUserid()
        return (
            <React.Fragment>
                {menuHierarchy && (<SidebarMenu onClose={this.closeMenu} menuHierarchy={menuHierarchy} onClickMenuItem={this.handleOpenFunction} open={menuOpen}>
                    <AppToolbar applicationDate={applicationDate} language={language != null ? language : Language.English} menuOpen={menuOpen}
                        onLogout={this.handleLogout} onMenuClick={this.toggleMenu} username={userid ? userid : ""} />
                    <XcNavigationTab onTabChange={this.handleTabChange} tabIndex={tabIndex}>
                        {panes}
                    </XcNavigationTab>
                </SidebarMenu>)}
            </React.Fragment>
        )
    }

    handleOpenFunction = (menuItem: MenuHierarchy) => {
        const { panes } = this.state
        const name = menuItem.name
        const form = pathMapping.get(name)

        const openedForm = _.findIndex(panes, e => e.props.id == name)

        if (openedForm == -1 && form) {
            panes.push(<XcNavigationTab.Pane key={name} id={name} label={xlate(`menu.${name}`)} component={form} ></XcNavigationTab.Pane>)
            this.setState({
                menuOpen: false,
                panes: panes,
                tabIndex: panes.length - 1
            })
        }
        else {
            this.setState({
                menuOpen: false
            })
        }
    }

    handleLogout = () => {
        authenticationService.logout().then(
            result => {
                navigator.push("/")
            }
        )
    }

    handleTabChange = (tabIndex: number) => {
        this.setState({ tabIndex: tabIndex })        
    }

    closeMenu = () => {
        this.setState({ menuOpen: false })        
    }

    toggleMenu = () => {
        const { menuOpen } = this.state
        this.setState({ menuOpen: !menuOpen })
    }    
}

export default (props: Props) => (
    <MessageContext.Consumer>
        {messageService => <Home {...props} messageService={messageService} />}
    </MessageContext.Consumer>
);