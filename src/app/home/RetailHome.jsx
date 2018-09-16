// @flow
import _ from 'lodash';
import * as React from 'react';

import { Accordion, Icon } from 'semantic-ui-react'
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
import { Order, OrderInputRequest } from 'app/model/order'
import { Currency, Exchange, ExchangeBoardPriceSpread, Instrument } from 'app/model/staticdata'
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'
import { authenticationService, currencyService, exchangeService, exchangeBoardPriceSpreadService, userProfileService } from 'app/service';
import OrderAmendForm from 'app/component/order/OrderAmendForm'
import OrderCancelForm from 'app/component/order/OrderCancelForm'
import OrderInputForm from 'app/component/order/OrderInputForm'
import OrderEnquiryForm from 'app/component/order/OrderEnquiryForm'
import PortfolioEnquiryForm from 'app/component/client/PortfolioEnquiryForm'

import './RetailHome.css';

type Props = {
}

type IntProps = {
    messageService: MessageService
}

type State = {
    activeIndex: number,
    currencies: Currency[],
    exchanges: Exchange[],
    exchangeBoardPriceSpreads: ExchangeBoardPriceSpread[],
    language: Language,
    tradingAccounts: SimpleTradingAccount[],
    selectedTradingAccount: ?SimpleTradingAccount,
    menuOpen: bool,
    panes: XcNavigationTab.Pane[],
    processingOrder: ?Order,
    tabIndex: number,
    tradingFloorComponent: ?any
}

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
            activeIndex: 0,
            currencies: [],
            exchanges: [],
            exchangeBoardPriceSpreads: [],
            language: _.find(Language.enumValues, (e) => (
                e.value == navigator.location.state.language
            )),
            processingOrder: null,
            selectedTradingAccount: null,
            tradingAccounts: [],
            menuOpen: false,
            panes: panes,
            tabIndex: 0,            
            tradingFloorComponent: null
        }
    }

    componentDidMount() {
        const { messageService } = this.props
        const { currencies, exchanges, exchangeBoardPriceSpreads, tradingAccounts } = this.state

        var promises = [
            currencies.length > 0 ? Promise.resolve({ data: currencies }) : currencyService.getPage(null, {}),
            exchanges.length > 0 ? Promise.resolve({ data: exchanges }) : exchangeService.getPage(null, {}),
            exchangeBoardPriceSpreads.length > 0 ? Promise.resolve({ data: exchaexchangeBoardPriceSpreadsnges }) : exchangeBoardPriceSpreadService.getPage(null, {}),
            tradingAccounts.length > 0 ? Promise.resolve(tradingAccounts) : userProfileService.getOwnedTradingAccount()
        ]

        messageService.showLoading()
        Promise.all(promises).then(result => {
            const exchanges = _.sortBy(result[1].data, ['sequence'])
            let panes = []
            const dummyForm = <DummyForm/>
            panes.push(<XcNavigationTab.Pane key={'Portfolio'} id={'Portfolio'} label={xlate('home.accountPortfolio')} component={<PortfolioEnquiryForm exchanges={exchanges} />} ></XcNavigationTab.Pane>)
            panes.push(<XcNavigationTab.Pane key={'Journal'} id={'Journal'} label={xlate('home.orderJournal')} component={<OrderEnquiryForm exchanges={exchanges} />} ></XcNavigationTab.Pane>)
            panes.push(<XcNavigationTab.Pane key={'OrderHistory'} id={'AccountInfo'} label={xlate('home.orderHistory')} component={dummyForm} ></XcNavigationTab.Pane>)
    
            this.setState({ currencies: result[0].data, exchanges: exchanges, exchangeBoardPriceSpreads: result[2].data, panes: panes, tradingAccounts: result[3] }, () => {
                messageService.hideLoading()
            })
        });
        
    }

    render() {
        const { messageService } = this.props;
        const { activeIndex } = this.state
        const { language, currencies, exchanges, selectedTradingAccount, tradingAccounts, menuOpen, panes, processingOrder, tabIndex, tradingFloorComponent } = this.state;
        console.log(tradingFloorComponent)
        const applicationDate = new Date()

        const sessionContext: SessionContextType = {
            cacheContext: {
                getCurrency: (currencyCode: string): ?Currency => {
                    const rtn = _.find(currencies, c => c.currencyCode == currencyCode)
                    return rtn
                },    
                getExchangeBoardPriceSpread: (exchangeBoardCode: string, exchangeBoardPriceSpreadCode: string) => {
                    const rtn = _.find(currencies, c => c.exchangeBoardCode == exchangeBoardCode && c.exchangeBoardPriceSpreadCode == exchangeBoardPriceSpreadCode)
                    return rtn
                }
            },
            languageContext: {
                language: language,
                selectLanguage: (language: Language) => {
                    this.setState({
                        language: language
                    })
                },    
            },
            navigationContext: {
                processingOrder: processingOrder,
                navigateToOrderAmendForm: (instrument: Instrument, order: Order) => {
                    const orderAmendForm = <OrderAmendForm exchanges={exchanges} instrument={instrument} order={order} />
                    this.setState({processingOrder: order, tradingFloorComponent: orderAmendForm})
                },
                navigateToOrderCancelForm: (instrument: Instrument, order: Order) => {
                    const orderCancelForm = <OrderCancelForm exchanges={exchanges} instrument={instrument} order={order} />
                    this.setState({processingOrder: order, tradingFloorComponent: orderCancelForm})
                },
                navigateToOrderInputForm: (orderInputRequest: ?OrderInputRequest) => {
                    this.setState({processingOrder: null, tradingFloorComponent: null})
                }
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
                                    <React.Fragment>
                                        <XcCard style={{ height: "50vh" }}>
                                            {tradingFloorComponent ? tradingFloorComponent : <OrderInputForm exchanges={exchanges} />}
                                        </XcCard>
                                        <Accordion style={{ height: "50vh" }} fluid styled>
                                            <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                                                <Icon name='dropdown' />
                                                What is a dog?
      </Accordion.Title>
                                            <Accordion.Content active={activeIndex === 0}>
                                                <p>
                                                    A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can
                                                    be found as a welcome guest in many households across the world.
        </p>
                                            </Accordion.Content>

                                            <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
                                                <Icon name='dropdown' />
                                                What kinds of dogs are there?
      </Accordion.Title>
                                            <Accordion.Content active={activeIndex === 1}>
                                                <p>
                                                    There are many breeds of dogs. Each breed varies in size and temperament. Owners often
                                                    select a breed of dog that they find to be compatible with their own lifestyle and
                                                    desires from a companion.
        </p>
                                            </Accordion.Content>

                                            <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
                                                <Icon name='dropdown' />
                                                How do you acquire a dog?
      </Accordion.Title>
                                            <Accordion.Content active={activeIndex === 2}>
                                                <p>
                                                    Three common ways for a prospective owner to acquire a dog is from pet shops, private
                                                    owners, or shelters.
        </p>
                                                <p>
                                                    A pet shop may be the most convenient way to buy a dog. Buying a dog from a private
                                                    owner allows you to assess the pedigree and upbringing of your dog before choosing to
                                                    take it home. Lastly, finding your dog from a shelter, helps give a good home to a dog
                                                    who may not find one so readily.
        </p>
                                            </Accordion.Content>
                                        </Accordion>
                                    </React.Fragment>                                    
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

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index

        this.setState({ activeIndex: newIndex })
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
