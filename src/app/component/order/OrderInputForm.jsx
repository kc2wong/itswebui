// @flow
import _ from 'lodash'
import React, { Component } from 'react';
import { DataType } from 'shared/model';
import { XcButton, XcButtonGroup, XcDialog, XcForm, XcInputText, XcInputNumber } from 'shared/component';
import { XcMessage, XcOption, XcRadio, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { formatNumber, Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { Currency, Exchange, ExchangeBoardPriceSpread, Instrument } from 'app/model/staticdata'
import { BuySell } from 'app/model/EnumType'
import { OrderRequest, OrderInputResourceBundle } from 'app/model/order'
import { AccountSelectorContext, type AccountSelectorContextType } from 'app/home/RetailHome';
import { MessageContext, MessageService } from 'shared/service';
import { orderService } from 'app/service'

type Props = {
    accountSelector: AccountSelectorContextType,
    messageService: ?MessageService,
    exchanges: Exchange[]
}

type State = {    
    orderRequest: OrderRequest,
    currency: ?Currency,
    instrument: ?Instrument,
    exchangeBoardPriceSpread: ?ExchangeBoardPriceSpread,
}

const formName = "orderInputForm"

class OrderInputForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const orderRequest = OrderRequest.newInstance()
        const selectedTradingAccount = props.accountSelector.gelectTradingAccount()
        if (selectedTradingAccount) {
            orderRequest.operationUnitCode = selectedTradingAccount.operationUnitCode
            orderRequest.tradingAccountCode = selectedTradingAccount.tradingAccountCode    
        }

        this.state = {
            orderRequest: orderRequest,
            currency: null,
            exchangeBoardPriceSpread: null,
            instrument: null
        }
    }    

    render() {
        const { exchanges } = this.props
        const { currency, instrument, orderRequest } = this.state

        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const buySellOpt = _.map(BuySell.enumValues, (e) => (
            new XcOption(e.value, xlate(`enum.buySell.${e.value}`))
        ))

        const currencyName = currency ? currency.getDescription(Language.English) : ""
        const instrumentName = instrument ? instrument.getDescription(Language.English) : null
        const lotSizeHint = instrument ? xlate(`${formName}.lotSizeHint`, [instrument.lotSize]) : null
        return (
            <XcForm model={orderRequest} name={formName} onModelUpdate={this.handleModelUpdate} subLabelColor="teal">
                <XcSelect name="exchangeCode" options={exchangeOpt} validation={{ required: true }} />
                <XcSelect name="buySell" options={buySellOpt} validation={{ required: true }} />
                <XcInputText name="instrumentCode" onBlur={this.handleSearchStock} subLabel={instrumentName} validation={{ required: true }} />
                <XcInputNumber name="price" prefix={currencyName} prefixMinWidth="55px" steppingDown={instrument ? instrument.lotSize : 0} steppingUp={instrument ? instrument.lotSize : 0} />
                <XcInputNumber name="quantity" steppingDown={instrument ? instrument.lotSize : 0} steppingUp={instrument ? instrument.lotSize : 0} subLabel={lotSizeHint} validation={{ required: true }} />
                <XcButtonGroup>
                    <XcButton name="reset" onClick={this.handleClick} />
                    <XcButton disabled={false}
                        name="submit" onClick={this.handleCalculateChargeCommission} primary />
                </XcButtonGroup>
            </XcForm>
        )
    }

    componentDidUpdate(prevProps: Props) {
        // in case another account is selected, update the account info to orderRequest
        const { accountSelector } = this.props;
        const { orderRequest } = this.state;
        const selectedTradingAccount = accountSelector.gelectTradingAccount()
        if (selectedTradingAccount && (orderRequest.operationUnitCode != selectedTradingAccount.operationUnitCode || orderRequest.tradingAccountCode != selectedTradingAccount.tradingAccountCode)) {
            orderRequest.operationUnitCode = selectedTradingAccount.operationUnitCode
            orderRequest.tradingAccountCode = selectedTradingAccount.tradingAccountCode
            this.setState({
                orderRequest: orderRequest
            })
        }
    }
            
    handleModelUpdate = (model: Object) => {
        this.setState({
            orderRequest: OrderRequest.fromJson(model)
        })
    }
    
    handleClick = (event: SyntheticMouseEvent<>) => {
    }    

    handleSearchStock = (event: SyntheticFocusEvent<>) => {
        const { exchangeCode, instrumentCode } = this.state.orderRequest
        if (!isNullOrEmpty(exchangeCode) && !isNullOrEmpty(instrumentCode)) {
            orderService.getOrderInputResourceBundle({ "exchangeCode": exchangeCode, instrumentCode: instrumentCode }).then(
                orderInputResourceBundle => {
                    this.setState({
                        currency: orderInputResourceBundle.currency,
                        exchangeBoardPriceSpread: orderInputResourceBundle.exchangeBoardPriceSpread,
                        instrument: orderInputResourceBundle.instrument
                    })
                }
            )
        }
    }    

    handleCalculateChargeCommission = (event: SyntheticFocusEvent<>) => {
        const { messageService } = this.props
        const { currency, orderRequest, instrument } = this.state
        const instrumentName = instrument ? instrument.getDescription(Language.English) : ""
        const currencyName = currency ? currency.getDescription(Language.English) : ""
        const decimalPoint = currency ? currency.decimalPoint : 2
        
        if (messageService) {
            messageService.showLoading()
        }
        orderService.calculateChargeCommission(orderRequest).then(
            chargeCommission => {
                if (messageService) {
                    const keyCol = new XcTableColSpec("key", DataType.String, "", 5, null)
                    const valueCol = new XcTableColSpec("value", DataType.String, "", 5, null)
                    const data = [
                        { key: xlate(`${formName}.tradingAccount`), value: orderRequest.tradingAccountCode },
                        { key: xlate(`${formName}.exchangeCode`), value: orderRequest.exchangeCode },
                        { key: xlate(`${formName}.instrumentCode`), value: `${orderRequest.instrumentCode} ${instrumentName}` },
                        { key: xlate(`${formName}.price`), value: `${currencyName} ${formatNumber(orderRequest.price, true, decimalPoint)}` },
                        { key: xlate(`${formName}.quantity`), value: orderRequest.quantity },
                        { key: xlate(`${formName}.grossAmount`), value: `${currencyName} ${formatNumber(chargeCommission.grossAmount, true, decimalPoint)}` },
                        { key: xlate(`${formName}.charge`), value: `${currencyName} ${formatNumber(chargeCommission.chargeAmount, true, decimalPoint)}` },
                        { key: xlate(`${formName}.commission`), value: `${currencyName} ${formatNumber(chargeCommission.commissionAmount, true, decimalPoint)}` },
                        { key: xlate(`${formName}.netAmount`), value: `${currencyName} ${formatNumber(chargeCommission.netAmount, true, decimalPoint)}` }
                    ]
                    const content = <XcTable colspec={[keyCol, valueCol]} data={data} selectable={false}></XcTable>

                    const dialog = <XcDialog confirmYesAction={() => { }}
                        confirmNoAction={() => { messageService && messageService.hideDialog() }}
                        content={content}
                        title={xlate(`${formName}.confirmOrderSubmission`)}
                        type={XcDialog.Type.YesNo} />

                    messageService.hideLoading()                
                    messageService.showDialog(dialog);
                }
            }
        )
    }

}

export default (props: Props) => (
    <MessageContext.Consumer>
        {messageService => <OrderInputForm {...props} messageService={messageService} />}
    </MessageContext.Consumer>
);