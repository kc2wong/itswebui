// @flow
import _ from 'lodash';
import * as React from 'react';

import { Accordion, Icon } from 'semantic-ui-react'
import { Pagable } from 'shared/model';
import { XaAccordion, XcCard, XcNavigationTab } from 'shared/component';
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
import { Currency, Exchange, ExchangeBoardPriceSpread, Instrument, OrderType } from 'app/model/staticdata'
import { SimpleTradingAccount } from 'app/model/client/simpleTradingAccount'
import { authenticationService, currencyService, exchangeService, exchangeBoardPriceSpreadService, orderTypeService, userProfileService } from 'app/service';
import OrderAmendForm from 'app/component/order/OrderAmendForm'
import OrderCancelForm from 'app/component/order/OrderCancelForm'
import OrderInputForm from 'app/component/order/OrderInputForm'
import OrderEnquiryForm from 'app/component/order/OrderEnquiryForm'
import OrderHistoryEnquiryForm from 'app/component/order/OrderHistoryEnquiryForm'
import PortfolioEnquiryForm from 'app/component/client/PortfolioEnquiryForm'
import PurchasePowerEnquiryForm from 'app/component/client/PurchasePowerEnquiryForm'
import PriceQuoteForm from 'app/component/staticdata/PriceQuoteForm'

import './RetailHome.css';
import { XcGrid } from '../../shared/component';

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
    orderTypes: OrderType[],
    tradingAccounts: SimpleTradingAccount[],
    selectedTradingAccount: ?SimpleTradingAccount,
    menuOpen: bool,
    panes: XcNavigationTab.Pane[],
    processingOrder: ?Order,
    tabIndex: number,
    tradingFloorComponent: ?any,
    tradingFloorComponentName: string
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

        this.state = {
            activeIndex: 0,
            currencies: [],
            exchanges: [],
            exchangeBoardPriceSpreads: [],
            language: _.find(Language.enumValues, (e) => (
                e.value == navigator.location.state.language
            )),
            orderTypes: [],
            processingOrder: null,
            selectedTradingAccount: null,
            tradingAccounts: [],
            menuOpen: false,
            panes: panes,
            tabIndex: 0,            
            tradingFloorComponent: null,
            tradingFloorComponentName: 'orderInputForm'
        }
    }

    componentDidMount() {
        const { messageService } = this.props
        const { currencies, exchanges, exchangeBoardPriceSpreads, orderTypes, tradingAccounts } = this.state

        var promises = [
            currencies.length > 0 ? Promise.resolve({ data: currencies }) : currencyService.getPage(null, {}),
            exchanges.length > 0 ? Promise.resolve({ data: exchanges }) : exchangeService.getPage(null, {}),
            exchangeBoardPriceSpreads.length > 0 ? Promise.resolve({ data: exchangeBoardPriceSpreads }) : exchangeBoardPriceSpreadService.getPage(null, {}),
            orderTypes.length > 0 ? Promise.resolve({ data: orderTypes }) : orderTypeService.getPage(null, {}),
            tradingAccounts.length > 0 ? Promise.resolve(tradingAccounts) : userProfileService.getOwnedTradingAccount()
        ]

        messageService.showLoading()
        Promise.all(promises).then(result => {
            const exchanges = _.sortBy(result[1].data, ['sequence'])
            let panes = []
            const dummyForm = <DummyForm/>
            panes.push(<XcNavigationTab.Pane key={'Portfolio'} id={'Portfolio'} label={xlate('home.accountPortfolio')} component={<PortfolioEnquiryForm exchanges={exchanges} />} ></XcNavigationTab.Pane>)
            panes.push(<XcNavigationTab.Pane key={'Journal'} id={'Journal'} label={xlate('home.orderJournal')} component={<OrderEnquiryForm exchanges={exchanges} />} ></XcNavigationTab.Pane>)
            panes.push(<XcNavigationTab.Pane key={'OrderHistory'} id={'AccountInfo'} label={xlate('home.orderHistory')} component={<OrderHistoryEnquiryForm exchanges={exchanges} />} ></XcNavigationTab.Pane>)
    
            this.setState({ currencies: result[0].data, exchanges: exchanges, exchangeBoardPriceSpreads: result[2].data, orderTypes: result[3].data, panes: panes, tradingAccounts: result[4] }, () => {
                messageService.hideLoading()
            })
        });
        
    }

    render() {
        const { messageService } = this.props;
        const { activeIndex } = this.state
        const { language, currencies, exchanges, exchangeBoardPriceSpreads, orderTypes, selectedTradingAccount, tradingAccounts, menuOpen, panes, processingOrder, tabIndex, tradingFloorComponent, tradingFloorComponentName } = this.state;
        const applicationDate = new Date()

        const sessionContext: SessionContextType = {
            cacheContext: {
                getCurrency: (currencyCode: string): ?Currency => {
                    const rtn = _.find(currencies, c => c.currencyCode == currencyCode)
                    return rtn
                },    
                getCurrencies: (): Currency[] => {
                    return currencies
                },    
                getExchangeBoardPriceSpread: (exchangeBoardCode: string, exchangeBoardPriceSpreadCode: string) => {
                    const rtn = _.find(exchangeBoardPriceSpreads, ps => ps.exchangeBoardCode == exchangeBoardCode && ps.exchangeBoardPriceSpreadCode == exchangeBoardPriceSpreadCode)
                    return rtn
                },
                getOrderTypes: (): OrderType[] => {
                    return orderTypes
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
                    this.setState({processingOrder: order, tradingFloorComponent: orderAmendForm, tradingFloorComponentName: 'orderAmendForm'})
                },
                navigateToOrderCancelForm: (instrument: Instrument, order: Order) => {
                    const orderCancelForm = <OrderCancelForm exchanges={exchanges} instrument={instrument} order={order} />
                    this.setState({processingOrder: order, tradingFloorComponent: orderCancelForm, tradingFloorComponentName: 'orderCancelForm'})
                },
                navigateToOrderInputForm: (orderInputRequest: ?OrderInputRequest) => {
                    this.setState({processingOrder: null, tradingFloorComponent: null, tradingFloorComponentName: 'orderInputForm'})
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
                selectedTradingAccount: () => { return selectedTradingAccount ? selectedTradingAccount : tradingAccounts.length > 0 ? tradingAccounts[0] : null}    
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
                                    <XcGrid>
                                        {/* <XcGrid.Row>
                                            <XcGrid.Col>
                                                <XcCard style={{ backgroundColor: "transparent", height: "45vh" }}>
                                                    {tradingFloorComponent ? tradingFloorComponent : <OrderInputForm exchanges={exchanges} />}
                                                </XcCard>
                                            </XcGrid.Col>
                                        </XcGrid.Row> */}
                                        <XcGrid.Row>
                                            <XcGrid.Col>
                                                <XaAccordion style={{ backgroundColor: "transparent", height: "100vh" }}>
                                                    <XaAccordion.Pane title={xlate("retailHome.tradingFloor") + " (" + xlate(`${tradingFloorComponentName}.title`) + ")"}>
                                                        {tradingFloorComponent ? tradingFloorComponent : <OrderInputForm exchanges={exchanges} />}
                                                    </XaAccordion.Pane>
                                                    <XaAccordion.Pane title={xlate('retailHome.quoteExpress')}>
                                                        <PriceQuoteForm exchanges={exchanges} />
                                                    </XaAccordion.Pane>
                                                    <XaAccordion.Pane title={xlate('retailHome.purchasePower')}>
                                                        <PurchasePowerEnquiryForm />
                                                    </XaAccordion.Pane>
                                                </XaAccordion>
                                            </XcGrid.Col>
                                        </XcGrid.Row>
                                    </XcGrid>                                                                   
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
