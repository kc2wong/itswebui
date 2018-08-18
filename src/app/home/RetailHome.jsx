// @flow
import _ from 'lodash';
import * as React from 'react';

import { Header, Segment } from 'semantic-ui-react'
import { Pagable } from 'shared/model';
import { XcCard, XcNavigationTab } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { getCurrentUserid } from 'shared/util/sessionUtil';
import { MessageContext, MessageService } from 'shared/service';
import { RetailAppToolbar, navigator, RetailSidebarMenu } from 'app/home';
import { MenuHierarchy } from 'app/model/security/menuHierarchy'
import CurrencyMaintenanceForm from 'app/component/staticdata/currency/CurrencyMaintenanceForm';
import StmActionMaintenanceForm from 'app/component/staticdata/stmaction/StmActionMaintenanceForm';
import { Exchange } from 'app/model/staticdata'
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'
import { authenticationService, exchangeService, userProfileService } from 'app/service';
import { OrderInputForm } from 'app/component/order/OrderInputForm';

import './RetailHome.css';
import { XcLabel } from '../../shared/component/XcLabel';

export type AccountSelectorContextType = {
    language: Language,
    availableTradingAccount: Array<SimpleTradingAccount>,
    selectTradingAccount: (SimpleTradingAccount: SimpleTradingAccount) => void,
    gelectTradingAccount: () => ?SimpleTradingAccount
}

const defaultAccountSelectorContextType: AccountSelectorContextType = {
    language: Language.English,
    selectLanguage: (language: Language) => {},
    availableTradingAccount: [], 
    selectTradingAccount: (SimpleTradingAccount: SimpleTradingAccount) => {},
    gelectTradingAccount: () => { return null}
}; 

export const AccountSelectorContext = React.createContext(defaultAccountSelectorContextType);

type Props = {
    messageService: MessageService,
    language: Language
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
            exchanges: [],
            language: props.language,
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
            this.setState({ exchanges: _.sortBy(result[0].data, ['sequence']), tradingAccounts: result[1] }, () => {
                messageService.hideLoading()
            })
        });
        
    }

    render() {
        // const { language } = this.props;
        const { language, exchanges, selectedTradingAccount, tradingAccounts, menuOpen, panes, tabIndex } = this.state;

        const applicationDate = new Date()

        const accountSelectorContextType: AccountSelectorContextType = {
            language: language,
            selectLanguage: (language: Language) => {
                this.setState({
                    language: language
                })
            },
            availableTradingAccount: tradingAccounts,
            selectTradingAccount: (simpleTradingAccount: SimpleTradingAccount) => {
                console.log('hihi')
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
        }; 

        let userid = getCurrentUserid()
        return (
            <AccountSelectorContext.Provider value={accountSelectorContextType}>
                <React.Fragment>
                    {(<RetailSidebarMenu onClose={this.closeMenu} onSelectAccount={this.handleSelectAccount} open={menuOpen} tradingAccounts={tradingAccounts}>
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
            </AccountSelectorContext.Provider>            
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
    <MessageContext.Consumer>
        {messageService => <RetailHome {...props} messageService={messageService} />}
    </MessageContext.Consumer>
);
