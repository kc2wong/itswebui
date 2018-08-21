// @flow
import _ from 'lodash'
import React, { Component } from 'react';
import { XcButton, XcButtonGroup, XcCheckbox, XcForm, XcGrid, XcInputText, XcInputNumber, XcLabel } from 'shared/component';
import { XcMessage, XcOption, XcRadio, XcSelect } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { Currency, Exchange, ExchangeBoardPriceSpread, Instrument } from 'app/model/staticdata'
import { OrderRequest, OrderInputResourceBundle } from 'app/model/order'
import { orderService } from 'app/service'
import { BuySell } from 'app/model/EnumType'

type Props = {
    exchanges: Exchange[]
}

type State = {    
    orderRequest: OrderRequest,
    currency: ?Currency,
    instrument: ?Instrument,
    exchangeBoardPriceSpread: ?ExchangeBoardPriceSpread
}

const formName = "orderInputForm"

export class OrderInputForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const orderRequest = OrderRequest.newInstance()
        orderRequest.exchangeOid = props.exchanges[0].exchangeOid
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
        const { orderRequest } = this.state
        orderService.calculateChargeCommission(orderRequest).then(
            simpleOrder => {
                console.log(simpleOrder)
            }
        )
    }

}
