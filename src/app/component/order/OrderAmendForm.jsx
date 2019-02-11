// @flow
import _ from 'lodash'
import React, { Component } from 'react';
import { DataType } from 'shared/model';
import { XcButton, XcButtonGroup, XcDialog, XcForm, XcFormGroup, XcInputText, XcInputNumber } from 'shared/component';
import { XcMessage, XcOption, XcRadio, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { createConfirmationDialog } from 'shared/component';
import { createNumberFormat, formatNumber, Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { Currency, Exchange, ExchangeBoardPriceSpread, Instrument } from 'app/model/staticdata'
import { BuySell } from 'app/model/EnumType'
import { Order, OrderInputRequest } from 'app/model/order'
import { MessageService } from 'shared/service';
import { orderService } from 'app/service'
import { ApplicationContext, type AccountContextType, type LanguageContextType, SessionContext, type SessionContextType } from 'app/context'
import { OrderCancelRequest } from '../../model/order/orderRequest';

type Props = {
    exchanges: Exchange[],
    instrument: Instrument,
    order: Order
}

type IntProps = {
    exchanges: Exchange[],
    instrument: Instrument,
    order: Order,
    messageService: MessageService,
    sessionContext: SessionContextType
}

type State = {    
    orderInputRequest: OrderInputRequest,
}

const formName = "orderAmendForm"

class OrderAmendForm extends React.Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);
        this.state = this.defaultState()
    }    

    render() {
        const { exchanges, instrument, order, messageService, sessionContext } = this.props
        const { orderInputRequest } = this.state

        const languageContext: LanguageContextType = sessionContext.languageContext
        const cacheContext = sessionContext.cacheContext

        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const buySellOpt = _.map(BuySell.enumValues, (e) => (
            new XcOption(e.value, xlate(`enum.buySell.${e.value}`))
        ))

        const instrumentName = instrument.getDescription(languageContext.language)
        const currency = cacheContext.getCurrency(instrument.tradingCurrencyCode)       
        const currencyName = currency ? currency.getDescription(languageContext.language) : ""
        const lotSizeHint = instrument ? xlate(`${formName}.lotSizeHint`, [instrument.lotSize]) : null

        const quantityFormat = createNumberFormat(true, 0)
        const priceFormat = createNumberFormat(true, currency ? currency.decimalPoint : 2)

        return (
            <React.Fragment>
                <h3 style={{color: "teal"}}>{xlate(`${formName}.title`)}</h3>
                <XcForm model={orderInputRequest} name={formName} onModelUpdate={this.handleModelUpdate} subLabelColor="teal">
                    <XcFormGroup>
                        <XcInputText name="orderNumber" readonly validation={{ required: true }} value={order.orderNumber} />
                        <XcInputText name="orderStatus" readonly validation={{ required: true }} value={xlate(`enum.externalOrderStatus.${order.orderStatus}`)} />
                    </XcFormGroup>
                    <XcFormGroup>
                        <XcSelect name="exchangeCode" options={exchangeOpt} readonly validation={{ required: true }} />
                        <XcSelect name="buySell" options={buySellOpt} readonly validation={{ required: true }} />
                    </XcFormGroup>                    
                    <XcInputText name="instrumentCode" readonly subLabel={instrumentName} validation={{ required: true }} />
                    <XcFormGroup >
                        <XcInputText name="price" readonly validation={{ required: true }} value={`${currencyName} ${formatNumber(order.price, priceFormat)}`} />
                        <XcInputText name="quantity" readonly validation={{ required: true }} value={formatNumber(order.quantity, quantityFormat)} />
                    </XcFormGroup>
                    <XcInputNumber label={xlate(`${formName}.newPrice`)} name="price" prefix={currencyName} prefixMinWidth="55px" steppingDown={instrument ? instrument.lotSize : 0} steppingUp={instrument ? instrument.lotSize : 0} />
                    <XcInputNumber label={xlate(`${formName}.newQuantity`)} name="quantity" steppingDown={instrument ? instrument.lotSize : 0} steppingUp={instrument ? instrument.lotSize : 0} subLabel={lotSizeHint} validation={{ required: true }} />
                    <br />
                    <XcButtonGroup>
                        <XcButton icon={{ name: "close" }} name="close" label={xlate('general.close')} onClick={this.handleCloseForm} />
                        <XcButton icon={{ name: "hand point up outline" }} name="submit" onClick={this.handleCalculateChargeCommission} primary />
                    </XcButtonGroup>
                </XcForm>
            </React.Fragment>
        )
    }
    
    handleCancelOrder = (event: SyntheticFocusEvent<>) => {
        const { exchanges, instrument, order, messageService, sessionContext } = this.props
        const languageContext: LanguageContextType = sessionContext.languageContext
        const cacheContext = sessionContext.cacheContext

        const instrumentName = instrument.getDescription(languageContext.language)
        const currency = cacheContext.getCurrency(instrument.tradingCurrencyCode)       
        const currencyName = currency ? currency.getDescription(languageContext.language) : ""

        const numberFormat = createNumberFormat(true, currency ? currency.decimalPoint : 2)

        const dialog = createConfirmationDialog(() => {
            messageService.showLoading()
            const promise = orderService.cancelOrder(new OrderCancelRequest(order.orderNumber))
            promise.then(
                order => {
                    messageService.hideLoading()
                    messageService.dismissDialog()
                    messageService.showInfoMessage(xlate(`${formName}.message.instructionSubmitted`, order.orderNumber))
                    this.handleCloseForm(null)
                },
                error => {
                    // TODO                
                    messageService.hideLoading()
                }
            )
        }, () => {messageService.dismissDialog()}, null, xlate(`${formName}.confirmOrderCancellation`, order.orderNumber))
        messageService.showDialog(dialog);
    }

    handleCalculateChargeCommission = (event: SyntheticFocusEvent<>) => {
        const { instrument, messageService, sessionContext } = this.props
        const { orderInputRequest  } = this.state

        const languageContext = sessionContext.languageContext
        const cacheContext = sessionContext.cacheContext

        const instrumentName = instrument.getDescription(languageContext.language)
        const currency = cacheContext.getCurrency(instrument.tradingCurrencyCode)
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
                        title={xlate(`${formName}.confirmOrderAmendment`)}
                        type={XcDialog.Type.YesNo} />

                    messageService.hideLoading()                
                    messageService.showDialog(dialog);
                }
            }
        )
    }

    handleModelUpdate = (model: Object) => {
        this.setState({
            orderInputRequest: OrderInputRequest.fromJson(model)
        })
    }

    handleCloseForm = (event: ?SyntheticMouseEvent<>) => {
        event && event.preventDefault()
        const { sessionContext } = this.props
        sessionContext.navigationContext.navigateToOrderInputForm()
    }    

    defaultState = (): Object => {
        const { order, sessionContext } = this.props
        const orderInputRequest = OrderInputRequest.newInstance()

        orderInputRequest.buySell = order.buySell
        orderInputRequest.tradingAccountCode = order.tradingAccountCode
        orderInputRequest.exchangeCode = order.exchangeCode
        orderInputRequest.instrumentCode = order.instrumentCode
        orderInputRequest.price = order.price
        orderInputRequest.quantity = order.quantity
        orderInputRequest.tradingAccountCode = order.tradingAccountCode    

        const selectedTradingAccount = sessionContext.accountContext.selectedTradingAccount()
        if (selectedTradingAccount) {
            orderInputRequest.operationUnitCode = selectedTradingAccount.operationUnitCode
        }

        return {
            orderInputRequest: orderInputRequest
        }
    }

}

export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <OrderAmendForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);
