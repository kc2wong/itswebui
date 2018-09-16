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
import { Order, OrderInputResourceBundle } from 'app/model/order'
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
}

const formName = "orderCancelForm"

class OrderCancelForm extends React.Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);
        this.state = this.defaultState()
    }    

    render() {
        const { exchanges, instrument, order, messageService, sessionContext } = this.props
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
        const quantityFormat = createNumberFormat(true, 0)
        const priceFormat = createNumberFormat(true, currency ? currency.decimalPoint : 2)

        return (
            <React.Fragment>
                <h3 style={{color: "teal"}}>{xlate(`${formName}.title`)}</h3>
                <XcForm model={order} name={formName} subLabelColor="teal">
                    <XcFormGroup>
                        <XcInputText name="orderNumber" readonly validation={{ required: true }} />
                        <XcInputText name="orderStatus" readonly validation={{ required: true }} value={xlate(`enum.externalOrderStatus.${order.orderStatus}`)} />
                    </XcFormGroup>
                    <XcSelect name="exchangeCode" options={exchangeOpt} readonly validation={{ required: true }} />
                    <XcSelect name="buySell" options={buySellOpt} readonly validation={{ required: true }} />
                    <XcInputText name="instrumentCode" readonly subLabel={instrumentName} validation={{ required: true }} />
                    <XcInputText name="price" readonly validation={{ required: true }} value={`${currencyName} ${formatNumber(order.price, priceFormat)}`} />
                    <XcFormGroup>
                        <XcInputText name="quantity" readonly validation={{ required: true }} value={formatNumber(order.quantity, quantityFormat)} />
                        <XcInputText name="executedQuantity" readonly validation={{ required: true }} value={formatNumber(order.executedQuantity, quantityFormat)} />
                    </XcFormGroup>
                    <br/>
                    <XcButtonGroup>
                        <XcButton icon={{name: "close"}} name="close" label={xlate('general.close')} onClick={this.handleCloseForm} />
                        <XcButton icon={{ name: "hand point up outline" }} name="submit" onClick={this.handleCancelOrder} primary />
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
                    messageService.showInfoMessage(xlate(`${formName}.message.instructionSubmitted`, [order.orderNumber]))
                    this.handleCloseForm(null)
                },
                error => {
                    // TODO                
                    messageService.hideLoading()
                }
            )
        }, () => {messageService.dismissDialog()}, null, xlate(`${formName}.confirmOrderCancellation`, [order.orderNumber]))
        messageService.showDialog(dialog);
    }

    handleCloseForm = (event: ?SyntheticMouseEvent<>) => {
        event && event.preventDefault()
        const { sessionContext } = this.props
        sessionContext.navigationContext.navigateToOrderInputForm()
    }    

    defaultState = (): Object => {
        return {
        }
    }

}

export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext =>
            <SessionContext.Consumer>
                {sessionContext => <OrderCancelForm {...props} messageService={applicationContext.messageService} sessionContext={sessionContext} />}
            </SessionContext.Consumer>
        }
    </ApplicationContext.Consumer>
);
