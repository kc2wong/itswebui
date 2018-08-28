// @flow
import _ from 'lodash';
import * as React from 'react';

import { Header, Segment } from 'semantic-ui-react'
import { Pagable } from 'shared/model';
import { XcCard, XcNavigationTab } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { getCurrentUserid } from 'shared/util/sessionUtil';
import { MessageService } from 'shared/service';
import { RetailAppToolbar, navigator } from 'app/home';
import RetailSidebarMenu from 'app/home/RetailSidebarMenu';
import { MenuHierarchy } from 'app/model/security/menuHierarchy'
import { ApplicationContext, SessionContext, type SessionContextType } from 'app/context'
import CurrencyMaintenanceForm from 'app/component/staticdata/currency/CurrencyMaintenanceForm';
import StmActionMaintenanceForm from 'app/component/staticdata/stmaction/StmActionMaintenanceForm';
import { Exchange } from 'app/model/staticdata'
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'
import { authenticationService, exchangeService, userProfileService } from 'app/service';
import OrderInputForm from 'app/component/order/OrderInputForm';
import PortfolioEnquiryForm from 'app/component/client/PortfolioEnquiryForm';

import './RetailHome.css';

type Props = {
}

type IntProps = {
    messageService: MessageService
}

type State = {
    exchanges: Array<Exchange>,
    language: Language,
    tradingAccounts: Array<SimpleTradingAccount>,
    selectedTradingAccount: ?SimpleTradingAccount,
    menuOpen: bool,
    panes: XcNavigationTab.Pane[],
    tabIndex: number
}

const pathMapping = new Map()
    .set('currencyMaintenance', <CurrencyMaintenanceForm />)
    .set('actionCodeMaintenance', <StmActionMaintenanceForm />)
    ;

class DummyForm extends React.Component<{}, {}> {
    render() {
        return <div style={{ height: "100vh" }}><p>Hello</p></div >
    }
}

class RetailHome extends React.Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props)

        let panes = []
        // const dummyForm = <DummyForm />
        // panes.push(<XcNavigationTab.Pane key={'Portfolio'} id={'Portfolio'} label={'Account Portfolio'} component={<PortfolioEnquiryForm/>} ></XcNavigationTab.Pane>)
        // panes.push(<XcNavigationTab.Pane key={'Journal'} id={'Journal'} label={'Order Journal'} component={dummyForm} ></XcNavigationTab.Pane>)
        // panes.push(<XcNavigationTab.Pane key={'AccountInfo'} id={'AccountInfo'} label={'Account 11Information'} component={dummyForm} ></XcNavigationTab.Pane>)

        this.state = {
            exchanges: [],
            language: _.find(Language.enumValues, (e) => (
                e.value == navigator.location.state.language
            )),
            selectedTradingAccount: null,
            tradingAccounts: [],
            menuOpen: false,
            panes: panes,
            tabIndex: 0,
        }
    }

    componentDidMount() {
        const { messageService } = this.props
        const { exchanges, tradingAccounts } = this.state

        var promises = [
            exchanges.length > 0 ? Promise.resolve({ data: exchanges }) : exchangeService.getPage(null, {}),
            tradingAccounts.length > 0 ? Promise.resolve(tradingAccounts) : userProfileService.getOwnedTradingAccount()
        ]

        messageService.showLoading()
        Promise.all(promises).then(result => {
            const exchanges = _.sortBy(result[0].data, ['sequence'])
            let panes = []
            const dummyForm = <DummyForm/>
            panes.push(<XcNavigationTab.Pane key={'Portfolio'} id={'Portfolio'} label={'Account Portfolio'} component={<PortfolioEnquiryForm exchanges={exchanges} />} ></XcNavigationTab.Pane>)
            panes.push(<XcNavigationTab.Pane key={'Journal'} id={'Journal'} label={'Order Journal'} component={dummyForm} ></XcNavigationTab.Pane>)
            panes.push(<XcNavigationTab.Pane key={'AccountInfo'} id={'AccountInfo'} label={'Account 11Information'} component={dummyForm} ></XcNavigationTab.Pane>)
    
            this.setState({ exchanges: exchanges, panes: panes, tradingAccounts: result[1] }, () => {
                messageService.hideLoading()
            })
        });
        
    }

    render() {
        const { messageService } = this.props;
        const { language, exchanges, selectedTradingAccount, tradingAccounts, menuOpen, panes, tabIndex } = this.state;

        const applicationDate = new Date()

        const sessionContext: SessionContextType = {
            languageContext: {
                language: language,
                selectLanguage: (language: Language) => {
                    this.setState({
                        language: language
                    })
                },    
            },
            accountContext: {
                availableTradingAccount: tradingAccounts,
                selectTradingAccount: (simpleTradingAccount: SimpleTradingAccount) => {
                    if (_.findIndex(tradingAccounts, ta => ta.tradingAccountCode == simpleTradingAccount.tradingAccountCode) > -1) {
                        this.setState({
                            menuOpen: false,
                            selectedTradingAccount: simpleTradingAccount,
                        })
                    }
                    else {
                        this.setState({
                            menuOpen: false
                        })
                    }
                },
                gelectTradingAccount: () => { return selectedTradingAccount ? selectedTradingAccount : tradingAccounts.length > 0 ? tradingAccounts[0] : null}    
            }
        }; 

        let userid = getCurrentUserid()
        return (
            <SessionContext.Provider value={sessionContext}>
                <React.Fragment>
                    {(<RetailSidebarMenu onClose={this.closeMenu} onSelectAccount={this.handleSelectAccount} open={menuOpen}>
                        <RetailAppToolbar applicationDate={applicationDate} language={language != null ? language : Language.English} menuOpen={menuOpen}
                            onLanguageChange={this.handleChangeLanguage} onLogout={this.handleLogout} onMenuClick={this.toggleMenu} username={userid ? userid : ""} />
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
                    </RetailSidebarMenu>)} 
                </React.Fragment>
            </SessionContext.Provider>            
        )
    }

    handleChangeLanguage = (language: Language) => {
        this.setState({
            language: language
        })
    }

    handleSelectAccount = (simpleTradingAccount: SimpleTradingAccount) => {
        this.setState({
            menuOpen: false
        })
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
    <ApplicationContext.Consumer>
        {applicationContext => <RetailHome {...props} messageService={applicationContext.messageService} />}
    </ApplicationContext.Consumer>
);
