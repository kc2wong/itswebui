// @flow
import _ from 'lodash'
import React, { Component } from 'react';
import { XcButton, XcButtonGroup, XcCheckbox, XcForm, XcGrid, XcInputText, XcInputNumber, XcLabel } from 'shared/component';
import { XcMessage, XcOption, XcRadio, XcSelect } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { Exchange, Instrument } from 'app/model/staticdata'
import { OrderRequest } from 'app/model/order'
import { instrumentService } from 'app/service'
import { BuySell } from 'app/model/EnumType'

type Props = {
    exchanges: Exchange[]
}

type State = {
    orderRequest: OrderRequest,
    instrument: ?Instrument
}

const formName = "orderInputForm"

export class OrderInputForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const orderRequest = OrderRequest.newInstance()
        orderRequest.exchangeOid = props.exchanges[0].exchangeOid
        this.state = {
            orderRequest: orderRequest,
            instrument: null
        }
    }    

    render() {
        const { exchanges } = this.props
        const { orderRequest, instrument } = this.state

        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const buySellOpt = _.map(BuySell.enumValues, (e) => (
            new XcOption(e.value, xlate(`enum.buySell.${e.value}`))
        ))

        const instrumentName = instrument ? instrument.getDescription(Language.English) : null
        const lotSizeHint = instrument ? xlate(`${formName}.lotSizeHint`, [instrument.lotSize]) : null
        return (
            <XcForm model={orderRequest} name={formName} onModelUpdate={this.handleModelUpdate} subLabelColor="teal">
                <XcSelect name="exchangeCode" options={exchangeOpt} validation={{ required: true }} />
                <XcSelect name="side" options={buySellOpt} validation={{ required: true }} />
                <XcInputText name="instrumentCode" onBlur={this.handleSearchStock} subLabel={instrumentName} validation={{ required: true }} />
                <XcInputNumber name="price" prefix={instrument ? instrument.tradingCurrencyCode : ""} prefixMinWidth="55px" stepping={instrument ? instrument.lotSize : 0} />
                <XcInputNumber name="quantity" stepping={instrument ? instrument.lotSize : 0} subLabel={lotSizeHint} validation={{ required: true }} />
                <XcButtonGroup>
                    <XcButton onClick={this.handleClick} label="#orderInputForm.reset" />
                    <XcButton disabled={isNullOrEmpty(orderRequest.exchangeOid) || isNullOrEmpty(orderRequest.stockCode)} primary onClick={this.handleClick} label="#orderInputForm.confirm" />
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
            instrumentService.getOne({ "exchangeCode": exchangeCode, instrumentCode: instrumentCode }).then(
                instrument => {
                    this.setState({ instrument: instrument })
                }
            )
        }
    }    

}
