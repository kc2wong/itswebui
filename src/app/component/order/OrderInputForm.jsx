// @flow
import _ from 'lodash'
import React, { Component } from 'react';
import { DataType } from 'shared/model';
import { XcButton, XcButtonGroup, XcDialog, XcForm, XcInputText, XcInputNumber } from 'shared/component';
import { XcMessage, XcOption, XcRadio, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { ThemeContext } from 'shared/component/XaTheme'
import { createNumberFormat, formatNumber, Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { Currency, Exchange, ExchangeBoardPriceSpread, Instrument } from 'app/model/staticdata'
import { BuySell } from 'app/model/EnumType'
import { OrderInputRequest, OrderInputResourceBundle } from 'app/model/order'
import { MessageService } from 'shared/service';
import { instrumentService, orderService } from 'app/service'
import { ApplicationContext, type AccountContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'

type Props = {
    exchanges: Exchange[]
}

type IntProps = {
    exchanges: Exchange[],
    messageService: MessageService,
    sessionContext: SessionContextType
}

type State = {    
    orderInputRequest: OrderInputRequest,
    instrument: ?Instrument
}

const formName = "orderInputForm"

class OrderInputForm extends React.Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);

        const orderInputRequest = OrderInputRequest.newInstance()
        const selectedTradingAccount = props.sessionContext.accountContext.gelectTradingAccount()
        if (selectedTradingAccount) {
            orderInputRequest.operationUnitCode = selectedTradingAccount.operationUnitCode
            orderInputRequest.tradingAccountCode = selectedTradingAccount.tradingAccountCode    
        }

        this.state = {
            orderInputRequest: orderInputRequest,
            instrument: null
        }
    }    

    render() {
        const { exchanges, sessionContext } = this.props
        // const { instrument, orderInputRequest } = this.state
        const { orderInputRequest } = this.state
        const languageContext: LanguageContextType = sessionContext.languageContext
        const { currency, instrument } = this.getInstrumentAndCurrency()

        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const buySellOpt = _.map(BuySell.enumValues, (e) => (
            new XcOption(e.value, xlate(`enum.buySell.${e.value}`))
        ))

        const cacheContext = sessionContext.cacheContext
        const instrumentName = instrument ? instrument.getDescription(languageContext.language) : ""
        const currencyName = currency ? currency.getDescription(languageContext.language) : ""
        const lotSizeHint = instrument ? xlate(`${formName}.lotSizeHint`, [instrument.lotSize]) : null

        return (
            <ThemeContext.Consumer>
                {theme => (
                    <React.Fragment>
                        <h3 style={{ color: theme.secondaryVariant }}>{xlate(`${formName}.title`)}</h3>
                        <XcForm model={orderInputRequest} name={formName} onModelUpdate={this.handleModelUpdate} subLabelColor="teal">
                            <XcSelect name="exchangeCode" options={exchangeOpt} validation={{ required: true }} />
                            <XcSelect name="buySell" options={buySellOpt} validation={{ required: true }} />
                            <XcInputText name="instrumentCode" onBlur={this.handleSearchStock} subLabel={instrumentName} validation={{ required: true }} />
                            <XcInputNumber name="price" prefix={currencyName} prefixMinWidth="55px" steppingDown={instrument ? instrument.lotSize : 0} steppingUp={instrument ? instrument.lotSize : 0} />
                            <XcInputNumber name="quantity" steppingDown={instrument ? instrument.lotSize : 0} steppingUp={instrument ? instrument.lotSize : 0} subLabel={lotSizeHint} validation={{ required: true }} />
                            <br />
                            <XcButtonGroup>
                                <XcButton icon={{ name: "erase" }} name="reset" onClick={this.handleClick} />
                                <XcButton disabled={false} icon={{ name: "hand point up outline" }}
                                    name="submit" onClick={this.handleCalculateChargeCommission} primary />
                            </XcButtonGroup>
                        </XcForm>
                    </React.Fragment>
                )}
            </ThemeContext.Consumer>
        )
    }

    componentDidUpdate(prevProps: IntProps) {
        // in case another account is selected, update the account info to orderInputRequest
        const { sessionContext } = this.props;
        const { orderInputRequest } = this.state;
        const selectedTradingAccount = sessionContext.accountContext.gelectTradingAccount()
        if (selectedTradingAccount && (orderInputRequest.operationUnitCode != selectedTradingAccount.operationUnitCode || orderInputRequest.tradingAccountCode != selectedTradingAccount.tradingAccountCode)) {
            orderInputRequest.operationUnitCode = selectedTradingAccount.operationUnitCode
            orderInputRequest.tradingAccountCode = selectedTradingAccount.tradingAccountCode
            this.setState({
                orderInputRequest: orderInputRequest
            })
        }
    }
            
    handleModelUpdate = (model: Object) => {
        this.setState({
            orderInputRequest: OrderInputRequest.fromJson(model)
        })
    }
    
    handleClick = (event: SyntheticMouseEvent<>) => {
    }    

    handleSearchStock = (event: SyntheticFocusEvent<>) => {
        const { exchangeCode, instrumentCode } = this.state.orderInputRequest
        if (!isNullOrEmpty(exchangeCode) && !isNullOrEmpty(instrumentCode)) {
            instrumentService.getOne({ exchangeCode: exchangeCode, instrumentCode: instrumentCode }).then(
                instrument => {
                    this.setState({
                        // currency: orderInputResourceBundle.currency,
                        // exchangeBoardPriceSpread: orderInputResourceBundle.exchangeBoardPriceSpread,
                        instrument: instrument
                    })
                }
            )
        }
    }    

    handleCalculateChargeCommission = (event: SyntheticFocusEvent<>) => {
        const { messageService, sessionContext } = this.props
        const { orderInputRequest } = this.state
        const { currency, instrument } = this.getInstrumentAndCurrency()

        const cacheContext = sessionContext.cacheContext
        const languageContext = sessionContext.languageContext
        const instrumentName = instrument ? instrument.getDescription(languageContext.language) : ""
        const currencyName = currency ? currency.getDescription(languageContext.language) : ""
        const numberFormat = createNumberFormat(true, currency ? currency.decimalPoint : 2)

        if (messageService) {
            messageService.showLoading()
        }        
        orderService.calculateChargeCommission(orderInputRequest).then(
            chargeCommission => {
                if (messageService) {
                    const keyCol = new XcTableColSpec("key", DataType.String, "", 5)
                    const valueCol = new XcTableColSpec("value", DataType.String, "", 5)
                    const data = [
                        { key: xlate(`${formName}.tradingAccount`), value: orderInputRequest.tradingAccountCode },
                        { key: xlate(`${formName}.exchangeCode`), value: orderInputRequest.exchangeCode },
                        { key: xlate(`${formName}.instrumentCode`), value: `${orderInputRequest.instrumentCode} ${instrumentName}` },
                        { key: xlate(`${formName}.price`), value: `${currencyName} ${formatNumber(orderInputRequest.price, numberFormat)}` },
                        { key: xlate(`${formName}.quantity`), value: orderInputRequest.quantity },
                        { key: xlate(`${formName}.grossAmount`), value: `${currencyName} ${formatNumber(chargeCommission.grossAmount, numberFormat)}` },
                        { key: xlate(`${formName}.charge`), value: `${currencyName} ${formatNumber(chargeCommission.chargeAmount, numberFormat)}` },
                        { key: xlate(`${formName}.commission`), value: `${currencyName} ${formatNumber(chargeCommission.commissionAmount, numberFormat)}` },
                        { key: xlate(`${formName}.netAmount`), value: `${currencyName} ${formatNumber(chargeCommission.netAmount, numberFormat)}` }
                    ]
                    const content = <XcTable colspec={[keyCol, valueCol]} compact={false} data={data} selectable={false} size={XcTable.Size.Large}></XcTable>
                    const positiveButton = <XcButton icon={{name: 'checkmark'}} label={xlate("general.confirm")} primary onClick={() => {}} />
                    const negativeButton = <XcButton icon={{name: 'remove'}} label={xlate("general.cancel")} onClick={() => {messageService && messageService.dismissDialog()}} />
                                
                    const dialog = <XcDialog confirmYesAction={() => { }}
                        negativeButton={negativeButton} positiveButton={positiveButton}
                        content={content}
                        title={xlate(`${formName}.confirmOrderSubmission`)}
                        type={XcDialog.Type.YesNo} />

                    messageService.hideLoading()                
                    messageService.showDialog(dialog);
                }
            }
        )
    }

    getInstrumentAndCurrency() {
        const { sessionContext } = this.props
        const { instrument } = this.state

        const cacheContext = sessionContext.cacheContext
        const currency = instrument ? cacheContext.getCurrency(instrument.tradingCurrencyCode) : null
        return { currency, instrument}
    }

}

export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <OrderInputForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);
