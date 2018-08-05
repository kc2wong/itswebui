// @flow
import _ from 'lodash';
import * as React from 'react';

import { Header, Segment } from 'semantic-ui-react'
import { Pagable } from 'shared/model';
import { XcCard, XcNavigationTab } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { getCurrentUserid } from 'shared/util/sessionUtil';
import { MessageContext, MessageService } from 'shared/service';
import { AppToolbar, navigator, SidebarMenu } from 'app/home';
import { MenuHierarchy } from 'app/model/security/menuHierarchy'
import CurrencyMaintenanceForm from 'app/component/staticdata/currency/CurrencyMaintenanceForm';
import StmActionMaintenanceForm from 'app/component/staticdata/stmaction/StmActionMaintenanceForm';
import { Exchange } from 'app/model/staticdata'
import { OrderRequest } from 'app/model/order'
import { authenticationService, exchangeService, userProfileService } from 'app/service';
import { OrderInputForm } from 'app/component/order/OrderInputForm';

import './RetailHome.css';
import { XcLabel } from '../../shared/component/XcLabel';

type Props = {
    messageService: MessageService,
    language: Language
}

type State = {
    menuHierarchy: ?MenuHierarchy,
    menuOpen: bool,
    panes: XcNavigationTab.Pane[],
    tabIndex: number,
    exchanges: Exchange[]
}

const pathMapping = new Map()
    .set('currencyMaintenance', <CurrencyMaintenanceForm />)
    .set('actionCodeMaintenance', <StmActionMaintenanceForm />)
    ;

class DummyForm extends React.Component<{}, {}> {
    render() {
        return null
    }
}

class RetailHome extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        let panes = []
        const dummyForm = <DummyForm />
        panes.push(<XcNavigationTab.Pane key={'Portfolio'} id={'Portfolio'} label={'Account Portfolio'} component={dummyForm} ></XcNavigationTab.Pane>)
        panes.push(<XcNavigationTab.Pane key={'Journal'} id={'Journal'} label={'Order Journal'} component={dummyForm} ></XcNavigationTab.Pane>)
        panes.push(<XcNavigationTab.Pane key={'AccountInfo'} id={'AccountInfo'} label={'Account Information'} component={dummyForm} ></XcNavigationTab.Pane>)

        this.state = {
            menuHierarchy: null,
            menuOpen: false,
            panes: panes,
            tabIndex: 0,
            exchanges: []
        }
    }

    componentDidMount() {
        const { messageService } = this.props
        const { menuHierarchy, exchanges } = this.state

        if (menuHierarchy == null) {
            messageService.showLoading()
            userProfileService.constructMainMenu().then(m => {
                this.setState({ menuHierarchy: m }, () => {
                    messageService.hideLoading()
                })
            })
        }

        if (exchanges.length == 0) {
            messageService.showLoading()
            exchangeService.getPage(null, {}).then(result => {
                console.log(result)
                this.setState({ exchanges: _.sortBy(result.data, ['sequence']) }, () => {
                    messageService.hideLoading()
                })
            })
        }
    }

    render() {
        const { language } = this.props;
        const { exchanges, menuHierarchy, menuOpen, panes, tabIndex } = this.state;

        const applicationDate = new Date()

        let userid = getCurrentUserid()
        return (
            <React.Fragment>
                <AppToolbar applicationDate={applicationDate} language={language != null ? language : Language.English} menuOpen={menuOpen}
                    onLogout={this.handleLogout} username={userid ? userid : ""} />
                <div style={{ flex: 1 }}>
                    <div className='orderPanel' >
                        {exchanges.length > 0 && (
                            <XcCard>
                                <h3>{xlate("retailHome.newOrder")}</h3>
                                <OrderInputForm exchanges={exchanges} />
                            </XcCard>
                        )}
                    </div>
                    <div className='traderPanel'>
                        <div className='vl' />
                        <XcNavigationTab onTabChange={this.handleTabChange} tabIndex={tabIndex}>
                            {panes}
                        </XcNavigationTab>
                    </div>
                </div >
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
        {messageService => <RetailHome {...props} messageService={messageService} />}
    </MessageContext.Consumer>
);